const { isValidObjectId } = require("mongoose");
const User = require("../models/user");

const { catchError } = require("../utils/help-functions");
const { notifyFollow } = require("../utils/notifications");

const extractFollowersInfo = (users, userId) => {
  infosToReturn = [];
  users.forEach((user) => {
    let infoToReturn = {
      userId: user.id,
      username: user.username,
      name: user.name,
      displayUrl: user.displayUrl,
      verified: user.verified,
      isFollowing: user.followers.includes(userId),
      isFollowedBy: user.following.includes(userId),
    };
    infosToReturn.push(infoToReturn);
  });
  return infosToReturn;
};

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

    const a = await userToFollow.addToFollowers(loggedInUserId);
    const b = await loggedInUser.addToFollowing(userToFollowId);
    notifyFollow(userToFollow, loggedInUser);

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
    res.status(200).json({ userUnFollowedId: userToUnFollowId });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getFollowFromUserName = async (req, res) => {
  const username = req.params.username;
  const field = req.query.field || null;
  const correctField = field === "followers" || field === "following";
  if (!username || !correctField) {
    return res
      .status(422)
      .json({ status: 422, message: "Input correct fields" });
  }
  try {
    const user = await User.findOne({ username }).populate({
      path: field,
      model: "User",
    });

    if (!user) {
      return res.status(401).json({ status: 401, message: "User not found" });
    }
    const usersToReturn = extractFollowersInfo(user[field], req.userId);
    usersToReturn.reverse();
    res.json({ users: usersToReturn });
  } catch (err) {
    catchError(err, res);
  }
};
