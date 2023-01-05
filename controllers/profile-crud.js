const { catchError } = require("../utils/help-functions");
const User = require("../models/user");
const { isValidObjectId } = require("mongoose");

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
    followingCount: user.following.length,
    followersCount: user.followers.length,
    isFollowing: user.followers.includes(req.userId),  // if you're in their followers array then you're following them
    isFollowedBy: user.following.includes(req.userId), 
  };
  if (displayLocal || displayUrl) { //only 'displayLocal' is actually enough check
    const fileExists = fs.existsSync(displayLocal); /* returns a boolean, since I store images in the hosting service temporarily
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
    const users = await User.find();
    const user = users.find(
      (user) => user.username.toLowerCase() === userName.toLowerCase()
      // makes sure the search is case insensitive
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

exports.getUserSuggestions = async (req, res) => {
  try {
    const posts = await Post.find();
    // I need posts because we'll suggest based on how active the person is 

    const user = await User.findById(req.userId);
    let allUsers = await User.find();

    const allUsers1 = allUsers.filter(
      // filter "allUsers" to make sure they do not include the logged in user's following,
      // in other words, the user is !part of their followers
      // I also made sure to remove the loggen in user 
      (thisUser) =>
        thisUser.id !== user.id && !thisUser.followers.includes(req.userId)
    );

    // I also made sure to filter further by amount of posts users have posted, giving priority to active users
      const allUsers2 = allUsers1.sort((first, second) => {
      const firstLength = posts.filter(
        (thisPost) => thisPost.author.toString() === first.id
      ).length;

      const secondLength = posts.filter(
        (thisPost) => thisPost.author.toString() === second.id
      ).length;

      return firstLength > secondLength ? -1 : 1;
    });
    const toReturn = extractSuggestionsInfo(allUsers2, req.userId);

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
    let found = users.filter(
      (user) => {
        const stringLength = string.length;
        const partOf = user.username.toLowerCase().substring(0, stringLength) === string.toLowerCase() 
        || user.name.toLowerCase().substring(0, stringLength) === string.toLowerCase() && user.id !== req.userId;
        return partOf;
      });
      // the "found" array contains users that match the search
    if (isValid) {
      found.sort((user) => {
        return user.followers.includes(req.userId) ? -1 : 1
      })
    }
    const toReturn = found.map((ele) => {
      return {
        username: ele.username,
        name: ele.name,
        displayUrl: ele.displayUrl
      }
    })
    res.status(200).json({ status: 200, users: toReturn });     
  } catch (err) {
    catchError(err, res);
  }

};