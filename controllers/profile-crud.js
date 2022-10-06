const { catchError } = require("../utils/catch-error");
const User = require("../models/user");
const fs = require("fs");
const { isValidObjectId } = require("mongoose");
const { validationResult } = require("express-validator");

const extractProfile = (user) => {
  const {
    name,
    username,
    stack,
    location,
    email,
    bio,
    verified,
    displayUrl,
    displayLocal,
    backdropLocal,
    backdropUrl,
  } = user;
  let profileToReturn = {
    name,
    username,
    stack,
    location,
    email,
    bio,
    followingCount: user.following.length,
    followersCount: user.followers.length,
    verified,
  };
  if (displayLocal || displayUrl) {
    const fileExists = fs.existsSync(displayLocal);
    profileToReturn.displayUrl = fileExists ? displayLocal : displayUrl;
  } else {
    profileToReturn.displayUrl = null;
  }
  if (backdropLocal || backdropUrl) {
    const fileExists = fs.existsSync(backdropLocal);
    profileToReturn.backdropUrl = fileExists ? backdropLocal : backdropUrl;
  } else {
    profileToReturn.backdropUrl = null;
  }
  return profileToReturn;
};

exports.getIndex = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(201).json({ message: `You're in! Logged in as ${user.name}` });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const profileToReturn = extractProfile(user);
    res.status(200).json(profileToReturn);
  } catch (err) {
    catchError(err, res);
  }
};

exports.getUserProfileFromUserName = async (req, res) => {
  try {
    const userName = req.params.username;
    if (!userName) {
      const error = new Error("Add /username na");
      error.statusCode = 401;
      throw error;
    }
    const user = await User.findOne({ username: userName });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    const profileToReturn = extractProfile(user);
    res.status(200).json(profileToReturn);
  } catch (err) {
    catchError(err, res);
  }
};

exports.getUserProfileFromId = async (req, res) => {
  try {
    const id = req.params.id;
    const isValid = isValidObjectId(id);
    console.log(id, isValid);
    if (!id || !isValid) {
      const error = new Error("Errmm. id is not valid");
      error.statusCode = 401;
      throw error;
    }
    const user = await User.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    const profileToReturn = extractProfile(user);
    res.status(200).json(profileToReturn);
  } catch (err) {
    catchError(err, res);
  }
};

exports.editProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  res.json({ message: "Oyaaa!" });
  // try {
  //   const { body, category, postedIn } = req.body;
  //   const post = new Post({
  //     body,
  //     category,
  //     postedIn,
  //     author: req.userId,
  //     imagesLocal: [],
  //     imagesUrl: [],
  //     imagesId: [],
  //     comments: [],
  //     likes: [],
  //     createdAt: Date.now().toString(),
  //   });
  //   const uploadedImages = req.files;
  //   uploadedImages.forEach((imgData) => {
  //     const imageLocalPath = imgData.path.replace("\\", "/");
  //     post.imagesLocal.push(imageLocalPath);
  //   });
  //   await post.save();
  //   res
  //     .status(200)
  //     .json({
  //       status: 200,
  //       message: "Posted Successfully!",
  //       postId: post.id,
  //     });
  //   uploadedImages.forEach((imgData) => {
  //     uploadToCloudinary(imgData.path, post.id);
  //   });
  // } catch (err) {
  //   catchError(err, res);
  // }
};
