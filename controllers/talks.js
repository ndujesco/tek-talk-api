const { isValidObjectId } = require("mongoose");
const Talk = require("../models/talk");
const User = require("../models/user");
const { catchError } = require("../utils/help-functions");

const extractAllTalks = (talks, users, userId) => {
  const toReturn = [];

  talks.forEach((talk) => {
    let toPush = {
      name: talk.name,
      displayUrl: talk.displayUrl,
      description: talk.description,
      memberOf: talk.users.includes(userId),
      usersDisplayUrl: [],
    };

    users.forEach((user) => {
      if (talk.users.includes(user.id) && user.displayUrl)
        usersDisplayUrl.push(user.displayUrl);
    });
    toReturn.push(toPush);
  });

  return toReturn;
};

exports.getTalks = async (req, res) => {
  try {
    const talks = await Talk.find().populate({ path: "users", model: "User" });
    const users = await User.find();

    return res.status(200).json({ status: 200, talks });
  } catch (err) {
    catchError(err, res);
  }
};

exports.joinTalk = async (req, res) => {
  const { talkId } = req.query;
  const isValid = isValidObjectId(talkId);
  if (!isValid)
    return res
      .status(422)
      .json({ status: 422, message: "the talkId is not valid" });
};
