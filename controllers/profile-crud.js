const { catchError } = require("../utils/help-functions");
const User = require("../models/user");
const { isValidObjectId, default: mongoose } = require("mongoose");

const fs = require("fs");

const Post = require("../models/post");
const { Notification } = require("../models/notification");

const extractProfile = (user, req) => {
  // So that I don't have to write same function over and over
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
    github,
    instagram,
    twitter,
    linkedIn,
  } = user;
  // The user object it takes as input contains all these keys

  let profileToReturn = {
    userId: user.id,
    name,
    username,
    stack,
    location,
    email,
    bio,
    verified,
    socials: {
      github,
      linkedIn,
      twitter,
      instagram,
    },
    followingCount: user.following.length,
    followersCount: user.followers.length,
    isFollowing: user.followers.includes(req.userId), // if you're in their followers array then you're following them
    isFollowedBy: user.following.includes(req.userId),
  };
  if (displayLocal || displayUrl) {
    //only 'displayLocal' is actually enough check
    const fileExists =
      fs.existsSync(
        displayLocal
      ); /* returns a boolean, since I store images in the hosting service temporarily
    I must check if it is still there */
    profileToReturn.displayUrl = fileExists
      ? "https://" + req.headers.host + "/" + displayLocal
      : displayUrl;
  } else {
    profileToReturn.displayUrl = null;
  }
  if (backdropLocal || backdropUrl) {
    const fileExists = fs.existsSync(backdropLocal); //same idea
    profileToReturn.backdropUrl = fileExists
      ? "https://" + req.headers.host + "/" + backdropLocal
      : backdropUrl;
  } else {
    profileToReturn.backdropUrl = null;
  }

  return profileToReturn;
};

const extractSuggestionsInfo = (users, userId) => {
  //info to return for user suggestion, it returns less info, so I can't use 'extractProfile'
  infosToReturn = [];
  users.forEach((user) => {
    let infoToReturn = {
      userId: user.id,
      username: user.username,
      name: user.name,
      displayUrl: user.displayUrl,
      verified: user.verified,
      isFollowedBy: user.following.includes(userId),
      isFollowing: user.followers.includes(userId),
    };
    infosToReturn.push(infoToReturn);
  });
  return infosToReturn;
};

exports.getIndex = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(201).json({ message: `You're in! Logged in as ${user.name}` });
  } catch (err) {
    catchError(err, res);
  }
}; // I use this to check if the app has not crashed.

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const profileToReturn = extractProfile(user, req);

    const myNotifications = await Notification.find({ userId: req.userId });
    const unRead = myNotifications.some((notification) => !notification.seen); // returns a boolean
    profileToReturn.unreadNotifications = unRead;
    // if you have !seen SOME notifications, it returns true
    res.status(200).json(profileToReturn);
  } catch (err) {
    catchError(err, res);
  }
};

exports.getUserProfileFromUserName = async (req, res) => {
  // Searches for user and extracts profile
  const userName = req.params.username;
  try {
    if (!userName) {
      const error = new Error("Add /username na");
      error.statusCode = 401;
      throw error;
    }
    const user = await User.findOne({
      username: { $regex: new RegExp("^" + userName.toLowerCase(), "i") },
    });

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

exports.getUserProfileFromId = async (req, res) => {
  const id = req.params.id;
  try {
    if (!id || !isValidObjectId(id)) {
      const error = new Error("Your id, hmm.");
      error.statusCode = 401;
      throw error;
    }
    const user = await User.findById(id);
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

exports.getUserSuggestions = async (req, res) => {
  try {
    const posts = await Post.find().populate({
      path: "author",
      model: "User",
      select: "name username displayUrl followers following verified",
    });
    // I need posts because we'll suggest based on how active the person is
    let idsArr = [];
    let users = {};

    posts.forEach((post) => {
      if (
        post.author.id !== req.userId &&
        !post.author.followers.includes(req.userId)
      ) {
        if (!users[post.author.id]) {
          idsArr.push(post.author.id);
          users[post.author.id] = post.author;
          users[post.author.id].count = 1;
        } else {
          users[post.author.id].count += 1;
        }
      }
    });
    idsArr = idsArr
      .sort((id1, id2) => (users[id1].count > users[id2].count ? -1 : 1))
      .slice(0, 5);

    const fiveUsers = idsArr.map((id) => users[id]);
    const toReturn = extractSuggestionsInfo(fiveUsers, req.userId);

    res.status(200).json({ users: toReturn.slice(0, 5) });
  } catch (err) {
    catchError(err, res);
  }
};

exports.checkUserName = async (req, res) => {
  const username = req.query.username || "cvbsbsvbsvbssk";
  if (username === "cvbsbsvbsvbssk") {
    return res.status(422).json({ status: 422, message: "Add username boss" });
  } // makes sure the frontend developer inputs somthing at all
  try {
    const users = await User.find();
    const found = users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    if (!found) {
      return res
        .status(200)
        .json({ status: 204, message: "User does not exist" });
    }
    res.status(200).json({ status: 200, message: "User exists!" });
  } catch (err) {
    catchError(err, res);
  }
};

exports.searchForUser = async (req, res) => {
  try {
    const isValid = isValidObjectId(req.userId); //returns a boolean
    const string = req.query.search;

    const users = await User.find();
    let found = users.filter((user) => {
      const stringLength = string.length;
      const partOf =
        user.username.toLowerCase().substring(0, stringLength) ===
          string.toLowerCase() ||
        (user.name.toLowerCase().substring(0, stringLength) ===
          string.toLowerCase() &&
          user.id !== req.userId);
      return partOf;
    });
    // the "found" array contains users that match the search
    if (isValid) {
      found.sort((user) => {
        return user.followers.includes(req.userId) ? -1 : 1;
      });
    }
    const toReturn = found.map((ele) => {
      return {
        username: ele.username,
        name: ele.name,
        displayUrl: ele.displayUrl,
      };
    });
    res.status(200).json({ status: 200, users: toReturn });
  } catch (err) {
    catchError(err, res);
  }
};
