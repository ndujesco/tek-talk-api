const { isValidObjectId } = require("mongoose");
const Talk = require("../models/talk");
const User = require("../models/user");
const { catchError } = require("../utils/help-functions");

exports.getTalks = async (req, res) => {
  try {
    const talks = await Talk.find().populate({ path: "users", model: "User" });
    const allTalks = [];
    const userTalks = [];

    talks.forEach((talk) => {
      let toPush = {
        id: talk.id,
        name: talk.name,
        displayUrl: talk.displayUrl,
        description: talk.description,
        memberOf: talk.users.some((user) => user.id === req.userId),
        usersDisplayUrl: [],
      };

      talk.users.forEach((user) => {
        if (user.displayUrl) toPush.usersDisplayUrl.push(user.displayUrl);
      });

      toPush.memberOf ? userTalks.push(toPush) : allTalks.push(toPush);
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

  if (!user.talksId.includes(talk.id)) user.talksId.push(talk.id);
  if (!talk.users.includes(user.id)) talk.users.push(user.id);

  user.save();
  talk.save();

  res.status(200).json({ status: 200, message: "Joined " + talk.name });
};

exports.leaveTalk = async (req, res) => {
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

  const userPosition = talk.users.indexOf(req.userId);
  const talkPosition = user.talksId.indexOf(talkId);

  if (userPosition > -1) talk.users.splice(userPosition, 1);
  if (talkPosition > -1) user.talksId.splice(talkPosition, 1);

  user.save();
  talk.save();

  res
    .status(200)
    .json({ status: 200, message: "Successfully left " + talk.name + "!" });
};

exports.popularAndSuggestedTalks = async (req, res) => {
  try {
    const talks = await Talk.find().populate({ path: "users", model: "User" });
    let suggestedTalks = [];
    let popularTalks = talks
      .sort((a, b) => (a.users.length > b.users.length ? -1 : 1))
      .slice(0, 5);

    if (req.userId) {
      suggestedTalks = talks.filter(
        (talk) => !talk.users.some((user) => user.id === req.userId)
      );
      // suggestedTalks =
    }

    res.status(200).json({ status: 200, popularTalks });
  } catch (err) {
    catchError(err, res);
  }
};
