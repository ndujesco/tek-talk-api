const { Router } = require("express");
const { body } = require("express-validator");
const { editProfile } = require("../controllers/edit-profile");
const { followUser, unFollowUser } = require("../controllers/like-follow");
const {
  postPost,
  getPostFromUserId,
  getAllPosts,
  getPostFromId,
  getPostsWithOrOutFeed,
} = require("../controllers/post-crud");

const {
  getIndex,
  getMyProfile,
  getUserProfileFromId,
  getUserProfileFromUserName,
} = require("../controllers/profile-crud");

const { isAuthenticated } = require("../middleware/is-auth");

const postValidator = [
  body("body", "Add 'body'.").isLength({ min: 1 }),
  body("category", "Add 'category'.").isLength({ min: 1 }),
  body("postedIn", "Add 'postedIn'.").isLength({ min: 1 }),
];

const router = Router();

router.get("/", isAuthenticated, getIndex);

router.get("/profile", isAuthenticated, getMyProfile);

router.get("/profile/username/:username", getUserProfileFromUserName);

router.get("/profile/id/:id", getUserProfileFromId);

router.post("/profile/edit", isAuthenticated, editProfile);

router.post("/post", isAuthenticated, postValidator, postPost);

router.get("/post/userId/:userId", getPostFromUserId);

router.get("/post", getAllPosts);

router.get("/post/postId/:postId", getPostFromId);

router.get("/post/feed/:bool", getPostsWithOrOutFeed);

router.put("/follow", isAuthenticated, followUser);

router.patch("/unfollow", isAuthenticated, unFollowUser);

module.exports = router;
