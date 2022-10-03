const crypto = require("crypto");
bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const { catchError } = require("../utils/catch-error");
const User = require("../models/user");
const { sendEmail } = require("../utils/send-mail");

exports.getReset = async (req, res) => {
  const { email, url } = req.query;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).json({ status: 422, foundEmail: false });
    }
    const buf = crypto.randomBytes(12);
    const token = buf.toString("hex");
    user.token = token;
    user.tokenExpiration = Date.now() + 3600000;
    const updatedUser = await user.save();
    res.status(200).json({
      status: 200,
      foundEmail: true,
      token: updatedUser.token,
      expires: updatedUser.tokenExpiration,
    });
    sendEmail({ email, url, token });
  } catch (err) {
    catchError(err, res);
  }
};

exports.updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: errors.array()[0].msg,
    });
  }
  const { email, newPassword, token } = req.query;
  try {
    const user = await User.findOne({
      email,
      token,
      tokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(422).json({
        status: 422,
        message:
          "Unable to update. The token is either expired or invalid. Check the email also",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    // user.token = undefined;
    // user.tokenExpiration = undefined;
    const updatedUser = await user.save();
    if (updatedUser) {
      res.status(200).json({ status: 200, message: "Password has been reset" });
    } else {
      res
        .status(500)
        .json({ status: 500, message: "Unable to update password" });
    }
  } catch (err) {
    catchError(err, res);
  }
};
