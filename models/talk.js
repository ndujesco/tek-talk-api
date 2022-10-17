const { Schema, default: mongoose } = require("mongoose");

const talkSchema = new Schema({
  name: String,

  description: String,

  displayUrl: String,

  users: [String],
});

module.exports = mongoose.model("talk", talkSchema); //kai, should've used capital t for consistenccy
