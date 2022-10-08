const bcrypt = require("bcryptjs");
const User = require("../models/user");

exports.editProfile = async (req, res) => {
  const { name, username, stack, location, email, bio, password } = req.body;
  const profileImage = req.files.profileImage ? req.files.profileImage : null;
  const backdropImage = req.files.backdropImage
    ? req.files.backdropImage
    : null;

  res.json({ message: "Oyaaa!" });
  try {
    const user = await User.findByIdAndUpdate();
  } catch (err) {
    catchError(err, res);
  }
};
