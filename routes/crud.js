const { Router } = require("express");
const { body } = require("express-validator");
const { editProfile } = require("../controllers/edit-profile");
const {
  followUser,
  unFollowUser,
  getFollowFromUserName,
} = require("../controllers/follow");
const {
  postComment,
  getCommentsFromPostId,
  likePost,
  unLikePost,
  getLikers,
} = require("../controllers/like-comment");
const {
  postPost,
  getAllPosts,
  getPostFromId,
  getPostsWithOrOutFeed,
  getPostsFromUserId,
  getFeedOrNotUserName,
} = require("../controllers/post-crud");

const {
  getIndex,
  getMyProfile,
  // getUserProfileFromId,
  getUserProfileFromUserName,
} = require("../controllers/profile-crud");

const { isAuthenticated } = require("../middleware/is-auth");
const { maybeAuthenticated } = require("../middleware/maybe-auth");

const postValidator = [
  body("body", "Add 'body'.").isLength({ min: 1 }),
  body("category", "Add 'category'.").isLength({ min: 1 }),
  body("postedIn", "Add 'postedIn'.").isLength({ min: 1 }),
];

const router = Router();

router.get("/", isAuthenticated, getIndex);

router.get("/profile", isAuthenticated, getMyProfile);

router.get(
  "/profile/username/:username",
  maybeAuthenticated,
  getUserProfileFromUserName
);

// router.get("/profile/id/:id", getUserProfileFromId);

router.patch("/profile/edit", isAuthenticated, editProfile);

router.post("/post", isAuthenticated, postValidator, postPost);

router.get("/post/id/:id", maybeAuthenticated, getPostsFromUserId);

router.get("/post", maybeAuthenticated, getAllPosts);

router.get("/post/postId/:postId", maybeAuthenticated, getPostFromId);

router.get("/post/feed", maybeAuthenticated, getFeedOrNotUserName);

// router.get("/post/feed/:userId", getPostsWithOrOutFeed);

router.put("/follow", isAuthenticated, followUser);

router.patch("/unfollow", isAuthenticated, unFollowUser);

router.get("/follow/:username", maybeAuthenticated, getFollowFromUserName);

router.post("/comment", isAuthenticated, postComment);

router.get("/comment", getCommentsFromPostId);

router.put("/like", isAuthenticated, likePost);

router.patch("/unlike", isAuthenticated, unLikePost);

router.get("/likers", maybeAuthenticated, getLikers);

module.exports = router;
