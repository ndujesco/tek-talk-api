const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const {
  uploadProfileToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary"); // functions to upload and delete images from cloudinary
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
  const toLoop = ["display", "backdrop"];

  const emptyProfiles = [];
  toUpdate.noDisplay ? emptyProfiles.push("display") : null;
  toUpdate.noBackdrop ? emptyProfiles.push("backdrop") : null;
  // so if the user removes their current picture, "noDisplay" or "noBackdrop" is added to the request

  for (key of toLoop) {
    if (images[key]) {
      const field = key + "Local"; // the only possible keys are display and backdrop
      const filePath = images[key][0].path;
      toUpdate[field] = filePath.replace("\\", "/");
    }
    //as it is the "backdropLocal" and "imageLocal" if sent have already being stored(temporarily, of course)
  }

  try {
    const user = await User.findById(req.userId);
    for (key in toUpdate) {
      if (key !== "noDisplay" && key !== "noBackdrop")
        user[key] = toUpdate[key];
    }
    //so we're updating  all other fields sent in the request body that are not "noDisplay" OR "noBackdrop"
    // these two fields tell whether or not these images were edited

    emptyProfiles.forEach((value) => {
      user[value + "Local"] = null;
      user[value + "Url"] = null;
      // user[value + "Id"] = null;
    });

    await user.save();
    res.status(200).json({ message: "Edited successfully!" });

    //should either delete the current Urls from cloudinary or upload or do nothing
    emptyProfiles.forEach((value) => {
      console.log(user[value + "Url"]);
      deleteFromCloudinary(user[value + "Id"]);
    });

    for (key of toLoop) {
      if (images[key]) {
        const field = key + "Url";
        const fieldId = key + "Id";
        const filePath = images[key][0].path;
        uploadProfileToCloudinary(filePath, req.userId, field, fieldId);
      }
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
