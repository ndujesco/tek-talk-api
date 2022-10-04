const { Schema, default: mongoose } = require("mongoose");

const postSchema = new Schema(
  {
    body: {
      type: String,
      required: true,
    },
    firstImageLocal: {
      type: String,
      default: null,
    },
    firstImageUrl: {
      type: String,
      default: null,
    },
    firstImageId: {
      default: null,
      type: String,
    },
    secondImageLocal: {
      type: String,
      default: null,
    },
    secondImageUrl: {
      type: String,
      default: null,
    },
    secondImageId: {
      default: null,
      type: String,
    },
    category: {
      type: String,
      required: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("post", postSchema);
