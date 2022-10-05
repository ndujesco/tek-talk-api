const { Schema, default: mongoose } = require("mongoose");

const likeSchema = new Schema(
  {
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Like", likeSchema);
