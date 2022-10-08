const Post = require("../models/post");
const User = require("../models/user");
const { catchError } = require("./help-functions");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.uploadPostToCloudinary = async (filePath, id) => {
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

exports.uploadProfileToCloudinary = async (filePath, id, field, fieldId) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "postImages",
    });
    const user = await User.findById(id);
    if (user[field]) {
      cloudinary.uploader.destroy(user["field"]);
    }
    user[field] = result.secure_url;
    user[fieldId] = result.public_id;
    await user.save();
  } catch (err) {
    console.log(err);
  }
};
