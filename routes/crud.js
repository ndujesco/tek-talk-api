const { Router } = require("express");
const { body } = require("express-validator");
const {
  editProfile,
  editProfileValidator,
} = require("../controllers/edit-profile");
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
  deleteComment,
} = require("../controllers/like-comment");
const {
  getNotifications,
  readNotifications,
} = require("../controllers/notifications");
const {
  postPost,
  getAllPosts,
  getPostFromId,
  getPostsFromUserId,
  getFeedOrNotUserName,
  deletePost,
  getUserRelatedPosts,
} = require("../controllers/post-crud");

const {
  getIndex,
  getMyProfile,
  // getUserProfileFromId,
  getUserProfileFromUserName,
  getUserSuggestions,
  checkUserName,
} = require("../controllers/profile-crud");

const { isAuthenticated } = require("../middleware/is-auth");
const { maybeAuthenticated } = require("../middleware/maybe-auth");

const postValidator = [
  body("body", "Add 'body'.").isLength({ min: 1 }),
  body("postedIn", "Add 'postedIn'.").isLength({ min: 1 }),
];

const router = Router();

router.get("/", isAuthenticated, getIndex);

router.get("/check-username", checkUserName);

router.get("/profile", isAuthenticated, getMyProfile);

router.get(
  "/profile/username/:username",
  maybeAuthenticated,
  getUserProfileFromUserName
);

// router.get("/profile/id/:id", getUserProfileFromId);

router.patch(
  "/profile/edit",
  isAuthenticated,
  editProfileValidator,
  editProfile
);

router.get("/suggestions", isAuthenticated, getUserSuggestions);

router.post("/post", isAuthenticated, postValidator, postPost);

router.get("/post/id/:id", maybeAuthenticated, getPostsFromUserId);

router.get("/post", maybeAuthenticated, getAllPosts);

router.get("/post/related-posts", maybeAuthenticated, getUserRelatedPosts);

router.get("/post/postId/:postId", maybeAuthenticated, getPostFromId);

router.get("/post/feed", maybeAuthenticated, getFeedOrNotUserName);

router.delete("/post", isAuthenticated, deletePost);

// router.get("/post/feed/:userId", getPostsWithOrOutFeed);

router.put("/follow", isAuthenticated, followUser);

router.patch("/unfollow", isAuthenticated, unFollowUser);

router.get("/follow/:username", maybeAuthenticated, getFollowFromUserName);

router.post("/comment", isAuthenticated, postComment);

router.get("/comment", getCommentsFromPostId);

router.delete("/comment", isAuthenticated, deleteComment);

router.put("/like", isAuthenticated, likePost);

router.patch("/unlike", isAuthenticated, unLikePost);

router.get("/likers", maybeAuthenticated, getLikers);

router.get("/notifications", isAuthenticated, getNotifications);

router.patch("/seen-notifications", isAuthenticated, readNotifications);

module.exports = router;
