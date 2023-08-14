const { isValidObjectId } = require("mongoose");
const Talk = require("../models/talk");
const User = require("../models/user");
const { catchError } = require("../utils/help-functions");

const extractTalkInfo = (talks, userId, maxUser) => {
  const toReturn = [];

  talks.forEach((talk) => {
    let toPush = {
      id: talk.id,
      memberCount: talk.users.length,
      name: talk.name,
      displayUrl: talk.displayUrl,
      description: talk.description,
      memberOf: talk.users.some((user) => user.id === userId),
      users: [],
    };

    talk.users.forEach((user, index) => {
      if (index < maxUser)
        toPush.users.push({
          username: user.username,
          displayUrl: user.displayUrl,
        });
    });

    toReturn.push(toPush);
  });
  return toReturn;
};

exports.getTalks = async (req, res) => {
  try {
    const talks = await Talk.find().populate({ path: "users", model: "User" });
    const allTalks = [];
    const userTalks = [];

    talks.forEach((talk) => {
      let toPush = {
        id: talk.id,
        name: talk.name,
        memberCount: talk.users.length,
        displayUrl: talk.displayUrl,
        description: talk.description,
        memberOf: talk.users.some((user) => user.id === req.userId),
        users: [],
      };

      talk.users.forEach((user, index) => {
        if (index < 5)
          toPush.users.push({
            username: user.username,
            displayUrl: user.displayUrl,
          });
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
    let suggestedTalks = talks;
    let popularTalks = talks
      .sort((a, b) => (a.users.length > b.users.length ? -1 : 1))
      .slice(0, 5);

    if (req.userId) {
      suggestedTalks = talks.filter(
        (talk) => !talk.users.some((user) => user.id === req.userId)
      );
    }

    popularTalks = extractTalkInfo(popularTalks, req.userId, 5);
    suggestedTalks = extractTalkInfo(suggestedTalks, req.userId, 5);
    suggestedTalks.sort(() => Math.random() - 0.5);

    res.status(200).json({
      status: 200,
      popularTalks,
      suggestedTalks: suggestedTalks.slice(0, 5),
    });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getUserTalks = async (req, res) => {
  try {
    const username = req.params.username;
    if (!username)
      return res.status(422).json({ status: 422, message: "input username" });

    const users = await User.find().populate({
      path: "talksId",
      model: "talk",
      populate: { path: "users", model: "User" },
    });
    const user = users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );

    if (!user)
      return res.status(401).json({ status: 401, message: "User not found!" });

    const userTalks = extractTalkInfo(user.talksId, req.userId, 5);
    res.status(200).json({ message: 200, userTalks });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getTalkFromName = async (req, res) => {
  const talkName = req.params.talkName;
  if (!talkName)
    return res.status(422).json({ status: 422, message: "Input talkname." });
  const talks = await Talk.find().populate({ path: "users", model: "User" });
  const talk = talks.find(
    (talk) => talk.name.toLowerCase() === talkName.toLowerCase()
  );
  if (!talk)
    return res.status(401).json({ status: 401, message: "Talk not found!" });
  const talkToReturn = extractTalkInfo([talk], req.userId, 10)[0]; // the "2" can be 1.
  res.status(200).json({ talkInfo: talkToReturn });
};

exports.addTalk = async (req, res) => {
  const { name, description, displayUrl } = req.body;
  const talk = Talk({
    name,
    description,
    displayUrl,
  });
  await talk.save();
};

exports.extractTalkInfo = extractTalkInfo; // for the network page
