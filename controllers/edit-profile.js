const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const { uploadProfileToCloudinary } = require("../utils/cloudinary");

exports.editProfile = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  const { name, username, stack, location, email, bio } = req.body;
  const images = req.files;

  for (key in images) {
    const field = key + "Local";
    console.log(images[key][0]);
  }

  // ? backdropImage.path.replace("\\", "/")

  try {
    // const user = await User.findByIdAndUpdate(req.userId, {
    //   ...req.body,
    // });

    res.json({ user: 2 });
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
