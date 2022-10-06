const { isValidObjectId } = require("mongoose");
const User = require("../models/user");

const { catchError } = require("../utils/catch-error");

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

    loggedInUser.removeFollowing(userToUnFollowId);
    userToUnFollow.removeFollower(loggedInUserId);

    res.status(200).json({ userUnFollowedId: userToUnFollowId });
  } catch (err) {
    catchError(err, res);
  }
};
