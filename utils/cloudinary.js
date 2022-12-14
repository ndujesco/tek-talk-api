const Event = require("../models/event");
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


exports.uploadEventToCloudinary = async (filePath, id) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "eventImages",
    });
    const event = await Event.findById(id)
    if(event.imageId) {
      cloudinary.uploader.destroy(event.imageId)
    }
    event.imageUrl = result.secure_url
    event.imageId = result.public_id
    await event.save();
  } catch (err) {
    console.log(err);
  }
}

exports.uploadProfileToCloudinary = async (filePath, id, field, fieldId) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "profileImages",
    });
    const user = await User.findById(id);
    if (user[field]) {
      cloudinary.uploader.destroy(user[fieldId]);
    }
    user[field] = result.secure_url;
    user[fieldId] = result.public_id;
    await user.save();
    console.log(field);
  } catch (err) {
    console.log(err.message);
  }
};

exports.deleteFromCloudinary = (id) => {
  cloudinary.uploader.destroy(id);
};
