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

exports.getUserProfile = async (req, res) => {
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
    bio = "";
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
};
