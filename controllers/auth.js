const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { catchError } = require("../utils/catch-error");

exports.signup = async (req, res) => {
  const errors = validationResult(req);
  const { password } = req.body;
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = User({
      ...req.body,
      password: hashedPassword,
    });
    const result = await user.save();
    res.status(201).json({
      status: 201,
      message: "User created!",
    });
  } catch (err) {
    catchError(err, res);
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  const { email, password } = req.body;
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("A user with this email could not be found.");
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_PRIVATE_KEY, {
      expiresIn: "30d",
    });
    res.status(200).json({ status: 200, token, userId: user.id });
  } catch (err) {
    catchError(err, res);
  }
};
