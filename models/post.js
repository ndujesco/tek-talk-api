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
        required: true,
      },
    ],
    imagesUrl: [
      {
        type: String,
      },
    ],
    imagesId: [
      {
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
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Like",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
