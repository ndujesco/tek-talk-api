const { Schema, default: mongoose } = require("mongoose");

const commentSchema = new Schema({
  body: {
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
  likes: [
    {
      type: String, //I will store the user (that liked) ids.
    },
  ],
  createdAt: String,
});

module.exports = mongoose.model("Comment", commentSchema);
