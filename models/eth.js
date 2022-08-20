const mongoose = require("mongoose");

const ethSchema = mongoose.Schema({
  price: Number,
  lastFetched: Date,
});

exports.Eth = mongoose.model("Eth", ethSchema);
