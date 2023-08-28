const { Router } = require("express");
const { body } = require("express-validator");
const { signup, login } = require("../controllers/auth");

const User = require("../models/user");

const stacks = [
  "Frontend Development",
  "Backend Development",
  "Fullstack Development",
  "DevOps",
  "UI/UX Design",
  "Product Design",
  "Mobile Development",
  "Data Analysis",
  "ML/AI",
  "Data Science",
  "App Development",
  "Cloud Computing",
  "Game Development",
  "CyberSecurity",
  "Technical Writing",
  "Guest",
  "I do not want to put myself in a box",
  "I am yet to decide",
  "I don't know, man",
];

router = Router();

router.post(
  "/signup",
  [
    body("email", "Email is invalid")
      .isEmail()
      .normalizeEmail()
      .custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email address already exists!");
          }
        });
      }),

    body("username")
      .trim()
      .custom((value) => {
        if (!value) throw new Error("username field cannot be empty");
        if (value.indexOf(" ") >= 0)
          throw new Error("username can't contain spaces");

        return User.find().then((users) => {
          const matches = users.some(
            (user) => user.username.toLowerCase() === value.toLowerCase()
            // username should not be the same at all, it is case sensitive
          );
          if (matches) {
            return Promise.reject("The username is already taken.");
            // I didn't use "throw" because it is inside the "then"
          }
        });
      }),

    body("password", "Passwords must have a minimum of 5 characters")
      .isLength({ min: 5 })
      .trim(),

    body("name", "Name field should not be empty").isLength({ min: 1 }).trim(),

    body("location", "Location field should not be empty")
      .isLength({ min: 1 })
      .trim(),

    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (!value) {
          throw new Error("Fill the 'confirmPassword' field.");
        }
        if (value.toString() !== req.body.password.toString()) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),

    body("stack")
      .isLength({ min: 1 })
      .trim()
      .custom((value, req) => {
        if (!stacks.includes(value)) {
          throw new Error(`Stack must be one of the following: ${stacks}`);
        }
        return true;
      }),
  ],
  signup
);

router.post(
  "/login",
  /*
  [
    body("email", "Email is invalid").isEmail().normalizeEmail(),

    body("password", "Passwords must have a minimum of 5 characters")
      .isLength({ min: 5 })
      .trim(),
  ],
  */
  login
);

module.exports = router;
