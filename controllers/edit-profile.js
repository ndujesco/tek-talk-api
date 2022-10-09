const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const {
  uploadProfileToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const { catchError } = require("../utils/help-functions");

exports.editProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  const toUpdate = req.body;
  const images = req.files;

  const emptyProfiles = [];
  toUpdate.noDisplay ? emptyProfiles.push("display") : null;
  toUpdate.noBackdrop ? emptyProfiles.push("backdrop") : null;

  for (key in images) {
    const field = key + "Local";
    const filePath = images[key][0].path;
    toUpdate[field] = filePath.replace("\\", "/");
  }

  try {
    const user = await User.findById(req.userId);

    for (key in toUpdate) {
      if (key !== "noDisplay" && key !== "noBackdrop")
        user[key] = toUpdate[key];
    }

    emptyProfiles.forEach((value) => {
      user[value + "Local"] = null;
      user[value + "Url"] = null;
      user[value + "Id"] = null;
    });

    await user.save();
    res.json({ user: 2 });

    //should either delete the current Urls from cloudinary or upload or do nothing
    emptyProfiles.forEach((value) => {
      deleteFromCloudinary(user[value + "Id"]);
    });

    for (key in images) {
      const field = key + "Url";
      const fieldId = key + "Id";
      const filePath = images[key][0].path;
      uploadProfileToCloudinary(filePath, req.userId, field, fieldId);
    }
  } catch (err) {
    catchError(err, res);
  }
};
exports.editProfileValidator = [
  body("email", "Email is invalid")
    .isEmail()
    .normalizeEmail()
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc && userDoc.id !== req.userId) {
          return Promise.reject("Email address already exists!");
        }
      });
    }),

  body("username")
    .trim()
    .custom((value, { req }) => {
      if (!value) {
        throw new Error("username field cannot be empty");
      }
      return User.find().then((users) => {
        const matches = users.some(
          (user) =>
            user.username.toLowerCase() === value.toLowerCase() &&
            user.id !== req.userId
        );

        if (matches) {
          return Promise.reject("The username is already taken.");
        }
      });
    }),

  body("name", "Name field should not be empty").isLength({ min: 1 }).trim(),

  body("location", "Location field should not be empty")
    .isLength({ min: 1 })
    .trim(),

  body("stack", "Stack should not be empty.").isLength({ min: 1 }).trim(),
];
