const { isValidObjectId } = require("mongoose");
const Comment = require("../models/comment");
const Post = require("../models/post");
const { catchError } = require("../utils/help-functions");

const extractCommentToSend = (comment) => {
  return {
    commentId: comment.id,
    authorId: comment.author.id,
    postId: comment.post,
    username: comment.author.username,
    authorImage: comment.author.displayUrl,
    isVerified: comment.author.verified,
    name: comment.author.name,
    commentBody: comment.body,
    commentDate: comment.createdAt,
  };
};

const extractLikersInfo = (users, userId) => {
  infosToReturn = [];
  users.forEach((user) => {
    let infoToReturn = {
      username: user.username,
      name: user.name,
      displayUrl: user.displayUrl,
      verified: user.verified,
      isFollowing: user.followers.includes(userId),
      isFollowedBy: user.following.includes(userId),
    };
    infosToReturn.push(infoToReturn);
  });
  return infosToReturn;
};
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

exports.getCommentsFromPostId = async (req, res) => {
  const postId = req.query.postId;
  const isValid = isValidObjectId(postId);

  try {
    if (!isValid) {
      const error = new Error("Errmm. postId is a invalid ");
      error.statusCode = 401;
      throw error;
    }
    const comments = await Comment.find({ post: postId }).populate("author");
    let commentsToSend = [];
    comments.forEach((comm) => {
      const commentToSend = extractCommentToSend(comm);
      commentsToSend.push(commentToSend);
    });
    commentsToSend.reverse();
    res.status(200).json({ comments: commentsToSend });
  } catch (err) {
    catchError(err, res);
  }
};

exports.likePost = async (req, res) => {
  const postId = req.query.postId;
  const loggedInUserId = req.userId;
  const isValid = isValidObjectId(postId);
  try {
    if (!isValid) {
      const error = new Error("Errmm. postId is a invalid ");
      error.statusCode = 401;
      throw error;
    }
    const post = await Post.findById(postId);
    if (!post.likes.includes(loggedInUserId)) {
      post.likes.push(loggedInUserId);
    }
    post.save();
    res.status(200).json({ message: "Liked!" });
  } catch (err) {
    catchError(err, res);
  }
};

exports.unLikePost = async (req, res) => {
  const postId = req.query.postId;
  const loggedInUserId = req.userId;
  const isValid = isValidObjectId(postId);
  try {
    if (!isValid) {
      const error = new Error("Errmm. postId is a invalid ");
      error.statusCode = 401;
      throw error;
    }
    const post = await Post.findById(postId);
    if (post.likes.includes(loggedInUserId)) {
      const position = post.likes.indexOf(loggedInUserId);
      post.likes.splice(position, 1);
    }
    post.save();

    res.status(200).json({ message: "UnLiked!" });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getLikers = async (req, res) => {
  const postId = req.query.postId;
  const loggedInUserId = req.userId;
  const isValid = isValidObjectId(postId);
  try {
    if (!isValid) {
      const error = new Error("Errmm. postId is a invalid oga");
      error.statusCode = 401;
      throw error;
    }

    const post = await Post.findById(postId).populate({
      path: "likes",
      model: "User",
    });
    const infoToReturn = extractLikersInfo(post.likes, loggedInUserId);

    res.status(200).json({ users: infoToReturn });
  } catch (err) {
    catchError(err, res);
  }
};
