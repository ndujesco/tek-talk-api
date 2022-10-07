const { body, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const fs = require("fs");

const Post = require("../models/post");

const { catchError } = require("../utils/help-functions");
const { uploadToCloudinary } = require("../utils/cloudinary");
const User = require("../models/user");

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
  };

  post.imagesLocal.forEach((img, index) => {
    const fileExists = fs.existsSync(img);

    if (fileExists) {
      postToSend.images.push("https://" + req.headers.host + "/" + img);
    } else {
      postToSend.images.push(post.imagesUrl[index]);
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
    const { body, postedIn } = req.body;
    const post = new Post({
      body,
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

exports.getPostsFromUserId = async (req, res) => {
  const id = req.params.id;
  const filter = req.query.filter;
  const pageNumber = +req.query.pageNumber || 1;
  const isValid = isValidObjectId(id);
  try {
    if (!id || !isValid) {
      return res.status(422).json({ status: 422, message: "Id is invalid" });
    }
    let posts = await Post.find({ author: id })
      .skip((pageNumber - 1) * 25)
      .limit(25)
      .populate("author");
    if (!posts) {
      return res.status(422).json({ status: 422, message: "Post not found" });
    }
    if (filter) {
      posts = posts.filter((post) => filter === post.postedIn);
    }
    let postsToSend = [];
    posts.forEach((post) => {
      const postToSend = extractPostToSend(post, req);
      postsToSend.push(postToSend);
    });
    postsToSend.reverse();
    res.status(200).json({ status: 200, posts: postsToSend });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getAllPosts = async (req, res) => {
  console.log(2);
  const filter = req.query.filter;
  const pageNumber = +req.query.pageNumber || 1;

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
    postsToSend.reverse();

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

exports.getFeedOrNotUserName = async (req, res) => {
  const username = req.query.username;
  const bool = req.query.feed || false;
  const isFeed = bool === "true" ? true : false;
  const pageNumber = +req.query.pageNumber || 1;

  try {
    if (!username) {
      const error = new Error("username???");
      error.statusCode = 422;
      throw error;
    }
    const users = await User.find();
    const user = users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    if (!user) {
      const error = new Error("Username Does not exist.");
      error.statusCode = 422;
      throw error;
    }
    const userId = user.id;
    let posts = await Post.find({ author: userId })
      .populate("author")
      .skip((pageNumber - 1) * 25)
      .limit(25);
    console.log(posts);
    posts = posts.filter((post) =>
      post.postedIn === "Feed" ? isFeed : !isFeed
    );

    let postsToSend = [];
    posts.forEach((post) => {
      const postToSend = extractPostToSend(post, req);
      postsToSend.push(postToSend);
    });
    postsToSend.reverse();

    res.status(200).json({ status: 200, posts: postsToSend });
  } catch (err) {
    catchError(err, res);
  }
};
