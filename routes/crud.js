const { Router } = require("express");
const { body } = require("express-validator");
const { followUser } = require("../controllers/follow");
const {
  postPost,
  getPostFromUserId,
  getAllPosts,
} = require("../controllers/post-crud");
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

router.get("/post/id/:id", getPostFromUserId);

router.get("/post", getAllPosts);

router.post("/follow", isAuthenticated, followUser);
module.exports = router;
