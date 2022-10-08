const bcrypt = require("bcryptjs");

exports.editProfile = async (req, res) => {
  // const user =
  const { name, username, stack, location, email, bio } = req.body;
  const profileImage = req.files.profileImage ? req.files.profileImage : null;
  const backdropImage = req.files.backdropImage
    ? req.files.backdropImage
    : null;

  res.json({ message: "Oyaaa!" });
  try {
  } catch (err) {
    catchError(err, res);
  }
};
