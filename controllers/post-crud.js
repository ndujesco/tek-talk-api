const { body, validationResult } = require("express-validator");
const Post = require("../models/post");
const { catchError } = require("../utils/catch-error");
const { uploadFile } = require("../utils/cloudinary");

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
    });
    console.log(1);
    const result = await post.save();
    console.log(result.id);
    // console.log(req.files);
    const uploadedImages = req.files;
    uploadedImages.forEach((imgData) => {
      console.log(imgData);
      //   uploadFile(imgData.path);
    });

    res.json({ message: "Success!" });
  } catch (err) {
    catchError(err, res);
  }
};
