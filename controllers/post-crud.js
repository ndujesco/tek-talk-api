const { body, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const fs = require("fs");

const Comment = require("../models/comment");
const Like = require("../models/like");
const Post = require("../models/post");

const { catchError } = require("../utils/catch-error");
const { uploadFile, uploadToCloudinary } = require("../utils/cloudinary");

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
    const { body, category } = req.body;
    const post = new Post({
      body,
      category,
      author: req.userId,
      imagesLocal: [],
      imagesUrl: [],
      imagesId: [],
      comments: [],
      likes: [],
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

exports.getPostFromId = async (req, res) => {
  try {
    const id = req.params.id;
    const isValid = isValidObjectId(id);
    if (!id || !isValid) {
      return res.status(422).json({ status: 422, message: "Invalid user id" });
    }
    const posts = await Post.find({
      author: "633a91328cf687423b8ae549",
    }).populate("author");
    if (!posts) {
      return res.status(422).json({ status: 422, message: "Post not found" });
    }
    let postsToSend = [];

    posts.forEach((post) => {
      let postToSend = {
        postId: post.id,
        authorId: id,
        username: post.author.username,
        name: post.author.name,
        commentCount: post.comments.length,
        likeCount: post.likes.length,
        postedIn: post.category,
        postBody: post.body,
        postDate: post.createdAt,
        images: [],
      };
      post.imagesLocal.forEach((img) => {
        console.log(img);

        const fileExists = fs.existsSync(img);
        console.log(fileExists);
      });
      //   console.log(postToSend);
    });
    res.json({ posts });
  } catch (err) {
    catchError(err, res);
  }
};
