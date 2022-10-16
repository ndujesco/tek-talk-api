const { Schema, default: mongoose } = require("mongoose");

const talkSchema = new Schema({
  name: String,

  imageUrl: String,

  description: String,

  displayUrl: String,

  userImages: [String],
});

module.exports = mongoose.model("talk", talkSchema);
