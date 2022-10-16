const Talk = require("../models/talk");
const { catchError } = require("../utils/help-functions");

exports.getTalks = async (req, res) => {
  try {
    const talks = await Talk.find();
  } catch (err) {
    catchError(err, res);
  }
};
