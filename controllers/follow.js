const { isValidObjectId } = require("mongoose");
const User = require("../models/user");

const { catchError } = require("../utils/help-functions");

exports.followUser = async (req, res) => {
  const userToFollowId = req.query.userId;
  const loggedInUserId = req.userId;
  try {
    const isValid = isValidObjectId(userToFollowId);

    if (!userToFollowId || !isValid) {
      const error = new Error("Errmm. id is not valid");
      error.statusCode = 401;
      throw error;
    }
    const userToFollow = await User.findById(userToFollowId);
    const loggedInUser = await User.findById(loggedInUserId);

    if (!userToFollow || !loggedInUser) {
      const error = new Error(
        "Errmm. id is a valid one but one of the users does not exist again (or never existed)"
      );
      error.statusCode = 401;
      throw error;
    }

    userToFollow.addToFollowers(loggedInUserId);
    loggedInUser.addToFollowing(userToFollowId);

    res.status(200).json({ userFollowedId: userToFollowId });
  } catch (err) {
    catchError(err, res);
  }
};

exports.unFollowUser = async (req, res) => {
  userToUnFollowId = req.query.userId;
  const loggedInUserId = req.userId;

  try {
    const isValid = isValidObjectId(userToUnFollowId);

    if (!userToUnFollowId || !isValid) {
      const error = new Error("Errmm. id is not valid");
      error.statusCode = 401;
      throw error;
    }

    const loggedInUser = await User.findById(loggedInUserId);
    const userToUnFollow = await User.findById(userToUnFollowId);

    if (!userToUnFollow || !loggedInUser) {
      const error = new Error(
        "Errmm. id is a valid one but one of the users does not exist again (or never existed)"
      );
      error.statusCode = 401;
      throw error;
    }

    const a = await loggedInUser.removeFollowing(userToUnFollowId);
    const b = await userToUnFollow.removeFollower(loggedInUserId);
    console.log(a, b);
    res.status(200).json({ userUnFollowedId: userToUnFollowId });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getFollowFromUserName = async (req, res) => {
  const ids = [
    "633c4e6745ce1436895d9f4e",
    "633eb11b1d4864912055f4f2",
    "63400b1aa83b4fb6fa58ed40",
    "63401e8d9648bdec7cd48700",
    "63401f789648bdec7cd4870c",
    "6340205a9648bdec7cd48732",
  ];

  const ugo = await User.findById("633dae0b84db7a1a751fe468");
  ugo.addToFollowers(id);
  const osemu = await User.findById("633dae0b84db7a1a751fe468");
  osemu.addToFollowers(id);
  osemu.save();
};
