const mongoose = require("mongoose");
const express = require("express");
const { connectDB } = require("./connectDB.js");
const { populatePokemons } = require("./populatePokemons.js");
const { getTypes } = require("./getTypes.js");
const { handleErr } = require("./errorHandler.js");
const morgan = require("morgan");
const cors = require("cors");
const tokensModel = require("./tokensModel.js");
const { asyncWrapper } = require("./asyncWrapper.js");
const dotenv = require("dotenv");
dotenv.config();
const app = express();

const {
  PokemonBadRequestMissingID,
  PokemonNotFoundError,
  PokemonDuplicateError,
  PokemonAuthError,
} = require("./errors.js");

var pokeModel = null;

const start = asyncWrapper(async () => {
  await connectDB({ drop: false });
  const pokeSchema = await getTypes();
  pokeModel = await populatePokemons(pokeSchema);
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
const userModel = require("./userModel.js");

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
    if (invalid_tokens["invalid_tokens"].includes(token)) {
      throw new PokemonAuthError("Invalid Token Verification. Log in again.");
    }
    try {
      const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      next();
    } catch (err) {
      throw new PokemonAuthError("Invalid Token Verification. Log in again.");
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
  "/api/v1/pokemons",
  asyncWrapper(async (req, res) => {
    if (!req.query["count"]) req.query["count"] = 10;
    if (!req.query["after"]) req.query["after"] = 0;
    const docs = await pokeModel
      .find({})
      .sort({ id: 1 })
      .skip(req.query["after"])
      .limit(req.query["count"]);
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

app.post(
  "/api/v1/pokemon/",
  asyncWrapper(async (req, res) => {
    console.log(req.body);
    if (!req.body.id) throw new PokemonBadRequestMissingID();
    const poke = await pokeModel.find({ id: req.body.id });
    if (poke.length != 0) throw new PokemonDuplicateError();
    const pokeDoc = await pokeModel.create(req.body);
    res.json({
      msg: "Added Successfully",
    });
  })
);

app.delete(
  "/api/v1/pokemon",
  asyncWrapper(async (req, res) => {
    const docs = await pokeModel.findOneAndRemove({ id: req.query.id });
    if (docs)
      res.json({
        msg: "Deleted Successfully",
      });
    else throw new PokemonNotFoundError("");
  })
);

app.put(
  "/api/v1/pokemon/:id",
  asyncWrapper(async (req, res) => {
    const selection = { id: req.params.id };
    const update = req.body;
    const options = {
      new: true,
      runValidators: true,
      overwrite: true,
    };
    const doc = await pokeModel.findOneAndUpdate(selection, update, options);
    if (doc) {
      res.json({
        msg: "Updated Successfully",
        pokeInfo: doc,
      });
    } else {
      throw new PokemonNotFoundError("");
    }
  })
);

app.patch(
  "/api/v1/pokemon/:id",
  asyncWrapper(async (req, res) => {
    const selection = { id: req.params.id };
    const update = req.body;
    const options = {
      new: true,
      runValidators: true,
    };
    const doc = await pokeModel.findOneAndUpdate(selection, update, options);
    if (doc) {
      res.json({
        msg: "Updated Successfully",
        pokeInfo: doc,
      });
    } else {
      throw new PokemonNotFoundError("");
    }
  })
);

app.get("/report", (req, res) => {
  console.log("Report requested");
  res.send(`Table ${req.query.id}`);
});

app.use(handleErr);

module.exports = app;
