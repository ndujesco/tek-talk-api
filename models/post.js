const { Schema, default: mongoose } = require("mongoose");

const blogPostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
  },
  date: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },

  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
  ],

  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("BlogPost", blogPostSchema);
