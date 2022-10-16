const { isValidObjectId } = require("mongoose");
const Talk = require("../models/talk");
const User = require("../models/user");
const { catchError } = require("../utils/help-functions");

exports.getTalks = async (req, res) => {
  try {
    const talks = await Talk.find().populate({ path: "users", model: "User" });
    const users = await User.find();
    const allTalks = [];
    const userTalks = [];

    talks.forEach((talk) => {
      let toPush = {
        name: talk.name,
        displayUrl: talk.displayUrl,
        description: talk.description,
        memberOf: talk.users.includes(req.userId),
        usersDisplayUrl: [],
      };

      users.forEach((user) => {
        if (talk.users.includes(user.id) && user.displayUrl)
          usersDisplayUrl.push(user.displayUrl);
      });

      if (toPush.memberOf) userTalks.push(toPush);
      allTalks.push(toPush);
    });

    return res.status(200).json({ status: 200, allTalks, userTalks });
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
      .json({ status: 422, message: "The talkId is not valid" });

  const user = await User.findById(req.userId);
  const talk = await Talk.findById(talkId);

  if (!user || !talk)
    return res
      .status(422)
      .json({ status: 422, message: "User or talk was not found" });

  user.talksId.push(talk.id);
  talk.users.push(user.id);

  user.save();
  talk.save();

  res.status(200).json({ status: 200, message: "Joined " + talk.name });
};
