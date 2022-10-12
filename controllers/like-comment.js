const { isValidObjectId, Types } = require("mongoose");
const Comment = require("../models/comment");
const { Notification } = require("../models/notification");
const Post = require("../models/post");
const User = require("../models/user");
const {
  catchError,
  checkForMentionedUser,
} = require("../utils/help-functions");
const {
  notifyLike,
  notifyComment,
  notifyMention,
} = require("../utils/notifications");

const extractCommentToSend = (comment, users) => {
  const commentInfoToReturn = {
    commentId: comment.id,
    authorId: comment.author.id,
    postId: comment.post,
    username: comment.author.username,
    authorImage: comment.author.displayUrl,
    isVerified: comment.author.verified,
    name: comment.author.name,
    commentBody: comment.body,
    commentDate: comment.createdAt,
    mentions: checkForMentionedUser(comment.body, users),
  };

  return commentInfoToReturn;
};

const extractLikersInfo = (users, userId) => {
  infosToReturn = [];
  users.forEach((user) => {
    let infoToReturn = {
      userId: user.id,
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

    if (post.author.toString() !== userId) notifyComment(req.userId, post);
    notifyMention(body, req.userId, "comment", postId);
  } catch (err) {
    catchError(err, res);
  }
};

exports.getCommentsFromPostId = async (req, res) => {
  const postId = req.query.postId;
  const isValid = isValidObjectId(postId);

  try {
    if (!isValid) {
      const error = new Error("Errmm. postId is a invalid");
      error.statusCode = 401;
      throw error;
    }
    const comments = await Comment.find({ post: postId }).populate("author");
    const users = await User.find();
    let commentsToSend = [];
    comments.forEach((comm) => {
      const commentToSend = extractCommentToSend(comm, users);
      commentsToSend.push(commentToSend);
    });
    commentsToSend.reverse();
    res.status(200).json({ comments: commentsToSend });
  } catch (err) {
    catchError(err, res);
  }
};

exports.deleteComment = async (req, res) => {
  const { commentId, postId } = req.query;
  const isValid = isValidObjectId(commentId);

  if (!isValid) {
    res.status(422).json({ status: 422, message: "This your id sha" });
  }

  try {
    await Comment.findByIdAndDelete(commentId);
    const posts = await Post.find();
    const post = posts.find((post) => {
      return post.comments.includes(commentId);
    });
    if (post) {
      const position = post.comments.indexOf(commentId);
      post.comments.splice(position, 1);
      post.save();
    }

    res.status(200).json({ message: "Deleted successfully" });
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
    const post = await Post.findById(postId).populate("author");
    if (!post.likes.includes(loggedInUserId)) {
      post.likes.push(loggedInUserId);
    }
    post.save();
    res.status(200).json({ message: "Liked!" });

    if (post.author.toString() !== req.userId) notifyLike(req.userId, post);
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
    infoToReturn.reverse();
    res.status(200).json({ users: infoToReturn });
  } catch (err) {
    catchError(err, res);
  }
};

// const update = { $pull: { "lists.$[list].items": { _id: checkedId } } };
// const options = { arrayFilters: [{ "list.name": listName }] };
