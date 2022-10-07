const { catchError } = require("../utils/help-functions");
const User = require("../models/user");
const fs = require("fs");
const { isValidObjectId } = require("mongoose");
const { validationResult } = require("express-validator");

const extractProfile = (user, req) => {
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
    userId: user.id,
    name,
    username,
    stack,
    location,
    email,
    bio,
    verified,
    followingCount: user.following.length,
    followersCount: user.followers.length,
    isFollowing: user.followers.includes(req.userId),
    isFollowedBy: user.following.includes(req.userId),
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
    const profileToReturn = extractProfile(user, req);
    res.status(200).json(profileToReturn);
  } catch (err) {
    catchError(err, res);
  }
};

exports.getUserProfileFromUserName = async (req, res) => {
  const userName = req.params.username;
  try {
    if (!userName) {
      const error = new Error("Add /username na");
      error.statusCode = 401;
      throw error;
    }
    const users = await User.find();
    const user = users.find(
      (user) => user.username.toLowerCase() === userName.toLowerCase()
    );
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    const profileToReturn = extractProfile(user, req);
    res.status(200).json(profileToReturn);
  } catch (err) {
    catchError(err, res);
  }
};
