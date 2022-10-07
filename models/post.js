const { Schema, default: mongoose } = require("mongoose");

const postSchema = new Schema({
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

  postedIn: {
    type: String,
    required: true,
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: String,
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [
    {
      type: String, //I will store the user (that liked) ids.
    },
  ],
});

module.exports = mongoose.model("Post", postSchema);
