const { body, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const fs = require("fs");

const Comment = require("../models/comment");
const Like = require("../models/like");
const Post = require("../models/post");

const { catchError } = require("../utils/catch-error");
const { uploadToCloudinary } = require("../utils/cloudinary");

const extractPostToSend = (post, req) => {
  const postToSend = {
    postId: post.id,
    authorId: post.author.id,
    username: post.author.username,
    authorImage: post.author.displayUrl,
    isVerified: post.author.verified,
    name: post.author.name,
    commentCount: post.comments.length,
    likeCount: post.likes.length,
    postedIn: post.postedIn,
    postBody: post.body,
    postDate: post.createdAt,
    images: [],
    category: post.category,
  };

  post.imagesLocal.forEach((img) => {
    const fileExists = fs.existsSync(img);

    if (fileExists) {
      postToSend.images.push("https://" + req.headers.host + "/" + img);
    } else {
      postToSend.images.push(...post.imagesUrl);
    }
  });
  return postToSend;
};

exports.postPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  try {
    const { body, category, postedIn } = req.body;
    const post = new Post({
      body,
      category,
      postedIn,
      author: req.userId,
      imagesLocal: [],
      imagesUrl: [],
      imagesId: [],
      comments: [],
      likes: [],
      createdAt: new Date().toString(),
    });
    const uploadedImages = req.files;
    uploadedImages.forEach((imgData) => {
      const imageLocalPath = imgData.path.replace("\\", "/");
      post.imagesLocal.push(imageLocalPath);
    });
    await post.save();
    res
      .status(200)
      .json({ status: 200, message: "Posted Successfully!", postId: post.id });
    uploadedImages.forEach((imgData) => {
      uploadToCloudinary(imgData.path, post.id);
    });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getPostFromUserName = async (req, res) => {
  const username = req.params.username;
  const filter = req.query.filter;
  const pageNumber = +req.query.pageNumber;
  try {
    if (!username) {
      return res
        .status(422)
        .json({ status: 422, message: "How about putting username" });
    }
    let posts = await Post.find({
      username,
    })
      .skip((pageNumber - 1) * 25)
      .limit(25)
      .populate("author");
    if (!posts) {
      return res.status(422).json({ status: 422, message: "Post not found" });
    }
    if (filter) {
      posts = posts.filter((post) => filter === post.category);
    }
    let postsToSend = [];
    posts.forEach((post) => {
      const postToSend = extractPostToSend(post, req);
      postsToSend.push(postToSend);
    });
    res.status(200).json({ status: 200, posts: postsToSend });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getAllPosts = async (req, res) => {
  console.log(2);
  const filter = req.query.filter;
  const pageNumber = +req.query.pageNumber;

  try {
    let posts = await Post.find()
      .skip((pageNumber - 1) * 25)
      .limit(25)
      .populate("author");
    if (filter) {
      posts = posts.filter((post) => filter === post.category);
    }
    console.log(posts);
    let postsToSend = [];
    posts.forEach((post) => {
      const postToSend = extractPostToSend(post, req);
      postsToSend.push(postToSend);
    });
    res.status(200).json({ status: 200, posts: postsToSend });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getPostFromId = async (req, res) => {
  const postId = req.params.postId;
  const isValid = isValidObjectId(postId);

  if (!postId || !isValid) {
    return res.status(422).json({ status: 422, message: "Invalid post id" });
  }

  try {
    const post = await Post.findById(postId).populate("author");
    if (!post) {
      const error = new Error(
        "Errmm. postId does not exist again or never existed"
      );
      error.statusCode = 401;
      throw error;
    }
    const postToSend = extractPostToSend(post, req);
    res.status(200).json({ status: 200, post: [postToSend] });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getPostsWithOrOutFeed = async (req, res) => {
  const bool = req.params.bool;
  const isFeed = bool === "true" ? true : false;
  let posts = await Post.findById(req.userId).populate("author");
  posts = posts.filter((post) => (post.postedIn === "Feed" ? isFeed : !isFeed));

  let postsToSend = [];
  posts.forEach((post) => {
    let postToSend;
    postToSend = extractPostToSend(postToSend, post, req);
    postsToSend.push(postToSend);
  });
  res.status(200).json({ status: 200, posts: postsToSend });
};
