const { Router } = require("express");
const { body } = require("express-validator");
const { postPost } = require("../controllers/post-crud");
const {
  getIndex,
  getUserProfile,
  getMyProfile,
  getUserProfileFromId,
} = require("../controllers/profile-crud");
const { isAuthenticated } = require("../middleware/is-auth");

const postValidator = [
  body("body").isLength({ min: 1 }),
  body("category").isLength({ min: 1 }),
];

const router = Router();

router.get("/", isAuthenticated, getIndex);

router.get("/profile", isAuthenticated, getMyProfile);

router.get("/profile/:username", getUserProfile);

router.get("/profile/id/:id", getUserProfileFromId);

router.post("/post", isAuthenticated, postValidator, postPost);

module.exports = router;
