const { catchError } = require("../utils/catch-error");
const User = require("../models/user");

exports.getIndex = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(201).json({ message: `You're in! Logged in as ${user.name}` });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const followingCount = 2;
    const followersCount = 500;
    const backdropUrl =
      "https://res.cloudinary.com/dtgigdp2j/image/upload/v1664820980/profileImages/c8otiaauqetohvrdpq2z.jpg";
    const displayUrl =
      "https://res.cloudinary.com/dtgigdp2j/image/upload/v1664821014/profileImages/dkqvt00s5i5n70djouc5.jpg";
    // const bio = ""
    let { name, username, stack, location, email, bio, verified } = user;
    if (!bio) {
      bio =
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Hic enim assumenda recusandae atque minus ipsa quidem expedita eligendi, modi accusamus consequuntur rerum? Aspernatur officia explicabo id quo? Earum, harum quidem?";
    }
    res.json({
      name,
      username,
      stack,
      location,
      email,
      backdropUrl,
      displayUrl,
      bio,
      followingCount,
      followersCount,
      verified,
    });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userName = req.params.username;
    if (!userName) {
      const error = new Error("Add /username na");
      error.statusCode = 401;
      throw error;
    }
    const user = await User.findOne({ username: userName });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    let followingCount = Math.floor(Math.random() * 1000);
    let followersCount = Math.floor(Math.random() * 1000);
    let backdropUrl = "https://placeimg.com/640/360/any";
    let displayUrl = "https://placeimg.com/640/360/any";
    if (user.username === "HoodieDan") {
      backdropUrl =
        "https://res.cloudinary.com/dtgigdp2j/image/upload/v1664820980/profileImages/c8otiaauqetohvrdpq2z.jpg";
      displayUrl =
        "https://res.cloudinary.com/dtgigdp2j/image/upload/v1664821014/profileImages/dkqvt00s5i5n70djouc5.jpg";
      followingCount = 2;
      followersCount = 500;
    }
    // const bio = ""
    let { name, username, stack, location, email, bio, verified } = user;
    if (!bio) {
      bio =
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Hic enim assumenda recusandae atque minus ipsa quidem expedita eligendi, modi accusamus consequuntur rerum? Aspernatur officia explicabo id quo? Earum, harum quidem?";
    }
    res.json({
      name,
      username,
      stack,
      location,
      email,
      backdropUrl,
      displayUrl,
      bio,
      followingCount,
      followersCount,
      verified,
    });
  } catch (err) {
    catchError(err, res);
  }
};
