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
  invalid_tokens: {
    type: Array,
  },
});

module.exports = mongoose.model("issuedTokens", schema);
