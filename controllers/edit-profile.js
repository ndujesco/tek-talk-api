const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { uploadProfileToCloudinary } = require("../utils/cloudinary");

exports.editProfile = async (req, res) => {
  const { name, username, stack, location, email, bio } = req.body;
  const profileImage = req.files.profileImage
    ? req.files.profileImage[0]
    : null;

  const backdropImage = req.files.backdropImage
    ? req.files.backdropImage[0]
    : null;

  const displayLocal = profileImage
    ? profileImage.path.replace("\\", "/")
    : null;

  const backdropLocal = backdropImage
    ? backdropImage.path.replace("\\", "/")
    : null;
  console.log(backdropLocal, displayLocal);

  try {
    const user = await User.findByIdAndUpdate(req.userId, {
      ...req.body,
      displayLocal,
      backdropLocal,
    });
    await user.save();

    backdropImage
      ? uploadProfileToCloudinary(
          backdropImage.path,
          req.userId,
          "backdropUrl",
          "backdropId"
        )
      : null;
    profileImage
      ? uploadProfileToCloudinary(
          profileImage.path,
          req.userId,
          "displayUrl",
          "displayId"
        )
      : null;

    res.json({ message: "Oyaaa!" });
  } catch (err) {
    catchError(err, res);
  }
};
