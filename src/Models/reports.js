const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: String,
    required: true,
    trim: true,
  },
  all_pokemons_visit: {
    type: Number,
    min: 0,
    default: 0,
  },
  pokemon_details_visit: {
    type: Number,
    min: 0,
    default: 0,
  },
  total: {
    type: Number,
    min: 0,
    default: 0,
  },
});

module.exports = mongoose.model("reports", schema);
