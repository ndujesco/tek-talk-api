const { Schema, Types, default: mongoose } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  stack: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  token: String,
  tokenExpiration: Date,
});

module.exports = mongoose.model("User", userSchema);
