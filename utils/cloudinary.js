const Post = require("../models/post");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

exports.uploadFile = async (filePath, id) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "postImages",
  });
  console.log(result);
};
