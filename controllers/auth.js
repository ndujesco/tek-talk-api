const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { catchError } = require("../utils/help-functions");

const followAdmins = async (userId) => {
  /* when they join they already follow these guys but I should call 
  this function so it reflects */
  const ugo = await User.findById("633dae0b84db7a1a751fe468");
  ugo.followers.push(userId);
  ugo.save();
  const osemu = await User.findById("633b45a338ad34f4b8940219");
  osemu.followers.push(userId);
  osemu.save();
};

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
      following: ["633dae0b84db7a1a751fe468", "633b45a338ad34f4b8940219"], //follow the admins
      followers: [],
      ...req.body,
      password: hashedPassword,
    });

    const result = await user.save();
    followAdmins(user.id); // like I said, it should reflect in their followers

    const token = jwt.sign({ userId: user.id }, process.env.JWT_PRIVATE_KEY, {
      expiresIn: "30d",
    }); // the token contains just the user id, which is enough to give all the user info
    res.status(201).json({
      status: 201,
      message: "User created!",
      token,
      userId:
        result.id /*They should be logged in immediately so the id should be sent.
    the id in the token (to be stored in the browser until it expires)
    is to keep track of subsequent actions by the user */,
    });
  } catch (err) {
    catchError(err, res);
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req); //checks for errors
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
      const error = new Error("A user with this email could not be found."); //makes sure the email is valid at all
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!"); //bcrpyt 'compares' password to make sure it matches
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_PRIVATE_KEY, {
      expiresIn: "30d",
    });
    res.status(200).json({ status: 200, token, userId: user.id });
    /*They should be logged in immediately so the id should be sent.
    the id in the token (to be stored in the browser until it expires)
    is to keep track of subsequent actions by the user */
  } catch (err) {
    catchError(err, res);
  }
};
