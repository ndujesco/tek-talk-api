const { Schema, default: mongoose } = require("mongoose");

const postSchema = new Schema(
  {
    body: {
      type: String,
      required: true,
    },
    imagesLocal: [
      {
        type: String,
        default: null,
      },
    ],
    imagesUrl: [
      {
        type: String,
        default: null,
      },
    ],
    imagesId: [
      {
        default: null,
        type: String,
      },
    ],

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

module.exports = mongoose.model("Post", postSchema);
