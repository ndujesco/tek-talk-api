const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const { catchError } = require("../utils/help-functions");
const User = require("../models/user");
const { sendEmail } = require("../utils/send-mail");

exports.getReset = async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).json({ status: 422, foundEmail: false });
    }
    const buf = crypto.randomBytes(12);
    const token = buf.toString("hex");
    user.token = token;
    user.tokenExpiration = Date.now() + 1800000;
    const updatedUser = await user.save();
    res.status(200).json({
      status: 200,
      foundEmail: true,
      token: updatedUser.token,
      expires: updatedUser.tokenExpiration,
    });
    sendEmail({ email, token });
  } catch (err) {
    catchError(err, res);
  }
};

exports.verifyToken = async (req, res) => {
  const { token } = req.query;
  const user = await User.findOne({
    token,
    tokenExpiration: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(422).json({
      status: 422,
      message: "The token is either expired or invalid.",
    });
  }
  res
    .status(200)
    .json({ status: 200, message: "Valid token!", email: user.email });
};

exports.updatePassword = async (req, res) => {
  const { email, newPassword } = req.query;
  try {
    const user = await User.findOne({
      email,
    });
    if (!user) {
      return res.status(422).json({
        status: 422,
        message: "Email not found.",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.token = undefined;
    user.tokenExpiration = undefined;
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

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res
        .status(401)
        .json({ status: 401, message: "User wasn't found somehow" });

    const matches = await bcrypt.compare(oldPassword, user.password);
    if (!matches)
      return res
        .status(422)
        .json({ status: 422, message: "Your old password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.save();

    return res.status(200).json({ status: 200, message: "Password changed!" });
  } catch (err) {
    catchError(err, res);
  }
};
