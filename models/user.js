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
  location: {
    type: String,
    required: true,
  },
  bio: String,
  verified: {
    type: Boolean,
    default: false,
  },
  followers: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  following: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  token: String,
  tokenExpiration: Date,
  displayUrl: String,
  dsiplayLocal: String,
  displayId: String,
  backdropUrl: String,
  backdropLocal: String,
  backdropId: String,
});

module.exports = mongoose.model("User", userSchema);
