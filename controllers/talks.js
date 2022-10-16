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
