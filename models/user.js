const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  transactions: [],
});

exports.User = mongoose.model("User", userSchema);
