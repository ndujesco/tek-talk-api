const Post = require("../models/post");
const { catchError } = require("./help-functions");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.uploadToCloudinary = async (filePath, id) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "postImages",
    });
    const post = await Post.findById(id);
    post.imagesUrl.push(result.secure_url);
    post.imagesId.push(result.public_id);
    await post.save();
  } catch (err) {
    console.log(err);
  }
};
