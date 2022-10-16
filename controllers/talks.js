const { isValidObjectId } = require("mongoose");
const Talk = require("../models/talk");
const User = require("../models/user");
const { catchError } = require("../utils/help-functions");

exports.getTalks = async (req, res) => {
  try {
    const talks = await Talk.find();
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
