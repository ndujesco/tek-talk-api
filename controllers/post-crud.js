const { body, validationResult } = require("express-validator");
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
    });
    const uploadedImages = req.files;
    uploadedImages.forEach((imgData) => {
      const imageLocalPath =
        "https://" + req.headers.host + "/" + imgData.path.replace("\\", "/");
      post.imagesLocal.push(imageLocalPath);
    });
    await post.save();
    res.status(200).json({ status: 200, message: "Posted Successfully!" });
    uploadedImages.forEach((imgData) => {
      uploadToCloudinary(imgData.path, post.id);
    });
  } catch (err) {
    catchError(err, res);
  }
};
