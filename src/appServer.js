const mongoose = require("mongoose");
const express = require("express");
const { connectDB } = require("./Models/connectDB.js");
const { populatePokemons } = require("./Models/populatePokemons.js");
const { getTypes } = require("./Models/getTypes.js");
const { handleErr } = require("./errorHandler.js");
const morgan = require("morgan");
const cors = require("cors");
const tokensModel = require("./Models/tokenModel.js");
const { asyncWrapper } = require("./asyncWrapper.js");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const userModel = require("./Models/userModel.js");
const axios = require("axios");

const { PokemonAuthError } = require("./errors.js");

var pokeModel = null;

const start = asyncWrapper(async () => {
  await connectDB({ drop: false });
  const pokeSchema = await getTypes();
  // pokeModel = await populatePokemons(pokeSchema);
  pokeModel = mongoose.model("pokemons", pokeSchema);

  app.listen(process.env.pokeServerPORT, (err) => {
    if (err) throw new PokemonDbError(err);
    else
      console.log(
        `Phew! Server is running on port: ${process.env.pokeServerPORT}`
      );
  });
});
start();
app.use(express.json());
const jwt = require("jsonwebtoken");

app.use(morgan(":method"));

app.use(cors());

const authUser = asyncWrapper(async (req, res, next) => {
  const header_info = req.header("Authorization").split(" ");
  if (header_info[0] === "Bearer") {
    const token = header_info[1];

    if (!token) {
      throw new PokemonAuthError(
        "No Token: Please provide the access token using the headers."
      );
    }

    const invalid_tokens = await tokensModel.findOne({
      username: req.query.user_id,
    });

    const user = await userModel.findOne({
      username: req.query.user_id,
    });

    if (invalid_tokens["invalid_tokens"].includes(token)) {
      throw new PokemonAuthError("Invalid Token Verification. Log in again.");
    }

    try {
      const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      next();
    } catch (err) {
      if (user.issued_tokens.includes(token)) {
        axios
          .post(
            `http://127.0.0.1:5040/requestNewAccessToken?username=${user.username}`,
            {},
            {
              headers: {
                Authorization: `Refresh ${user.refresh_token}`,
              },
            }
          )
          .catch((error) => {
            console.error(error);
          });

        next();
      } else {
        throw new PokemonAuthError("Invalid Token Verification. Log in again.");
      }
    }
  } else {
    res.json({
      msg: "Invalid Token: Must be a bearer token!",
    });
  }
});

const authAdmin = asyncWrapper(async (req, res, next) => {
  const header_info = req.header("Authorization").split(" ");
  if (header_info[0] === "Bearer") {
    const payload = jwt.verify(header_info[1], process.env.ACCESS_TOKEN_SECRET);
    const invalid_tokens = await tokensModel.findOne({
      username: req.query.user_id,
    });
    if (invalid_tokens["invalid_tokens"].includes(header_info[1])) {
      throw new PokemonAuthError("Invalid Token Verification. Log in again.");
    }
    if (payload?.user?.role == "admin") {
      return next();
    }
    throw new PokemonAuthError("Access denied");
  } else {
    res.json({
      msg: "Invalid Token: Must be a bearer token!",
    });
  }
});

app.use(authUser);

app.get(
  "/api/v1/allPokemons",
  asyncWrapper(async (req, res) => {
    const docs = await pokeModel.find({});
    res.json(docs);
  })
);

app.get(
  "/api/v1/pokemon",
  asyncWrapper(async (req, res) => {
    const { id } = req.query;
    const docs = await pokeModel.find({ id: id });
    if (docs.length != 0) res.json(docs);
    else res.json({ errMsg: "Pokemon not found" });
  })
);

app.use(authAdmin);

app.get("/report", (req, res) => {
  res.send(`Table ${req.query.id}`);
});

app.use(handleErr);

module.exports = app;
