const user = require("../models/user");
const { catchError } = require("../utils/catch-error");

exports.followUser = async (req, res) => {
  const id = req.userId;

  try {
    const User = user;
    res.status(200).json({ status: 200 });
  } catch (err) {
    catchError(err, res);
  }
};
