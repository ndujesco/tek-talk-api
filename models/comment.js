const { Schema, default: mongoose } = require("mongoose");

const commentSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
