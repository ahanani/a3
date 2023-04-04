const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    min: 3,
    max: 20,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    min: 6,
    max: 1000,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    min: 3,
  },
  role: {
    type: String,
    required: true,
    trim: true,
    default: "user",
    enum: ["user", "admin"],
  },
  active: {
    type: Boolean,
    required: true,
    default: null,
  },
  token_invalid: {
    type: Boolean,
    required: true,
    default: true,
  },
  access_token: {
    type: String,
    trim: true,
    default: null,
  },
  refresh_token: {
    type: String,
    trim: true,
    default: null,
  },
  issued_tokens: {
    type: Array,
  },
});

module.exports = mongoose.model("pokeusers", schema);
