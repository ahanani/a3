const mongoose = require("mongoose");
const express = require("express");
const { asyncWrapper } = require("./asyncWrapper.js");
require("dotenv").config();
const userModel = require("./Models/userModel.js");
const tokensModel = require("./Models/tokenModel.js");
const { connectDB } = require("./Models/connectDB.js");
const cors = require("cors");
const bodyParser = require("body-parser");

const {
  PokemonDbError,
  PokemonAuthError,
} = require("./errors.js");

const authServer = express();
authServer.use(express.json());
authServer.use(
  cors({
    exposedHeaders: ["Authorization"],
  })
);
authServer.use(bodyParser.json());
authServer.use(bodyParser.urlencoded({ extended: true }));

const start = asyncWrapper(async () => {
  await connectDB({ drop: false });

  authServer.listen(process.env.authServerPORT, async (err) => {
    if (err) throw new PokemonDbError(err);
    else
      console.log(
        `Phew! Server is running on port: ${process.env.authServerPORT}`
      );
    const doc = await userModel.findOne({ username: "admin" });
    const tokens = await tokensModel.findOne({ username: "admin" });
    if (!doc && !tokens) {
      userModel.create({
        username: "admin",
        password: bcrypt.hashSync("admin", 10),
        role: "admin",
        email: "admin@admin.ca",
        active: false,
      });
      tokensModel.create({
        username: "admin",
      });
    }
  });
});

start();

const bcrypt = require("bcrypt");

authServer.post(
  "/register",
  asyncWrapper(async (req, res) => {
    const { username, password, email } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userWithHashedPassword = { ...req.body, password: hashedPassword };

    const user = await userModel.create(userWithHashedPassword);
    const tokens_list = await tokensModel.create({ username: username });
    res.send([user, tokens_list]);
  })
);

const jwt = require("jsonwebtoken");

let issued_tokens = [];

authServer.post(
  "/requestNewAccessToken",
  asyncWrapper(async (req, res) => {
    const header_info = req.header("Authorization").split(" ");
    const user = await userModel.findOne({ username: req.query.username });
    const tokens = await tokensModel.findOne({ username: req.query.username });
    issued_tokens = tokens["invalid_tokens"];
    if (header_info[0] === "Refresh") {
      const refreshToken = header_info[1];
      if (!refreshToken) {
        throw new PokemonAuthError("No Token: Please provide a token.");
      }
      try {
        const payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        const accessToken = jwt.sign(
          { user: payload.user },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "30s" }
        );

        current_tokens = user.issued_tokens;
        current_tokens.push(accessToken);

        const updated_user = await userModel.findOneAndUpdate(
          { username: user.username },
          {
            $set: {
              access_token: accessToken,
              issued_tokens: current_tokens,
            },
          },
          { returnDocument: "after" }
        );

        res.header("Authorization", accessToken);
        res.json({ msg: "All good!", "updated user": updated_user });
      } catch (error) {
        throw new PokemonAuthError(
          "Invalid Token: Please provide a valid token."
        );
      }
    } else {
      res.json({
        msg: "Invalid Token: Must be a refresh token!",
      });
    }
  })
);

authServer.post(
  "/login",
  asyncWrapper(async (req, res) => {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username: username });

    if (!user) throw new PokemonAuthError("User not found");

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) throw new PokemonAuthError("Password is incorrect");

    const accessToken = jwt.sign(
      { user: user },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );
    const refreshToken = jwt.sign(
      { user: user },
      process.env.REFRESH_TOKEN_SECRET
    );

    issued_tokens = user.issued_tokens;
    issued_tokens.push(accessToken);

    const updated_user = await userModel.findOneAndUpdate(
      { username: username },
      {
        $set: {
          access_token: accessToken,
          refresh_token: refreshToken,
          token_invalid: false,
          issued_tokens: issued_tokens,
          active: true,
        },
      },
      { returnDocument: "after" }
    );

    res.header("Authorization", accessToken);
    res.send(updated_user);
  })
);

authServer.get("/user", asyncWrapper(async (req, res) => {
  const { id } = req.query;
  const userDoc = await userModel.findOne({username: id});
  if (userDoc.active) res.json(userDoc);
  res.json("Not signed in!");
}))

authServer.get(
  "/logout",
  asyncWrapper(async (req, res) => {
    const req_info = req.query.appid.split(" ");
    if (req_info[0] === "Bearer") {
      const user = await userModel.findOne({ access_token: req_info[1] });
      if (!user) {
        throw new PokemonAuthError("User not found");
      }

      let user_invalid_tokens = await tokensModel.findOne({
        username: user.username,
      });

      const result = user_invalid_tokens["invalid_tokens"].concat(
        user.issued_tokens
      );

      await tokensModel.findOneAndUpdate(
        { username: user.username },
        {
          $set: {
            invalid_tokens: result,
          },
        },
        { returnDocument: "after" }
      );

      await userModel.findOneAndUpdate(
        { username: user.username },
        {
          $set: {
            access_token: null,
            refresh_token: null,
            token_invalid: true,
            issued_tokens: [],
            active: false,
          },
        },
        { returnDocument: "after" }
      );
      res.send("Logged out");
    } else {
      res.json({
        msg: "Invalid Token: Must be a bearer token!",
      });
    }
  })
);

module.exports = authServer;
