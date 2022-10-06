const { isValidObjectId } = require("mongoose");
const Comment = require("../models/comment");
const Post = require("../models/post");
const { catchError } = require("../utils/catch-error");

exports.postComment = async (req, res) => {
  const userId = req.userId;
  const { postId, body } = req.body;
  const isValid = isValidObjectId(postId);

  try {
    if (!isValid) {
      const error = new Error("Errmm. postId is a invalid ");
      error.statusCode = 401;
      throw error;
    }
    const comment = await Comment({
      body,
      post: postId,
      author: userId,
      createdAt: new Date().toString(),
    });
    comment.save();

    const post = await Post.findById(postId);
    post.comments.push(comment.id);
    post.save();
    res.json({ commentId: comment.id });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
  } catch (err) {
    catchError(err, res);
  }
};
