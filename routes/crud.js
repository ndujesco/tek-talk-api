const { Router } = require("express");
const { body } = require("express-validator");
const {
  editProfile,
  editProfileValidator,
} = require("../controllers/edit-profile");
const { createEvent, eventValidator, getAllEvents, rsvpEvent, removeRsvp, deleteEvent, editEvent, getEventFromId } = require("../controllers/events");

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
const { searchForAnything } = require("../controllers/network");

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
  getUserProfileFromUserName,
  getUserSuggestions,
  checkUserName,
  searchForUser,
} = require("../controllers/profile-crud");

const {
  getTalks,
  joinTalk,
  leaveTalk,
  popularAndSuggestedTalks,
  getUserTalks,
  getTalkFromName,
} = require("../controllers/talks");

const { isAuthenticated } = require("../middleware/is-auth");
const { maybeAuthenticated } = require("../middleware/maybe-auth");

const postValidator = [
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

router.patch(
  "/profile/edit",
  isAuthenticated,
  editProfileValidator,
  editProfile
);

router.get("/suggestions", isAuthenticated, getUserSuggestions);

router.get("/tag-user", maybeAuthenticated, searchForUser)

router.post("/post", isAuthenticated, postValidator, postPost);

router.get("/post/id/:id", maybeAuthenticated, getPostsFromUserId);

router.get("/post", maybeAuthenticated, getAllPosts);

router.get("/post/related-posts", maybeAuthenticated, getUserRelatedPosts);

router.get("/post/postId/:postId", maybeAuthenticated, getPostFromId);

router.get("/post/feed", maybeAuthenticated, getFeedOrNotUserName);

router.delete("/post", isAuthenticated, deletePost);

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

router.get("/talk", isAuthenticated, getTalks);

router.get("/talk/talk-name/:talkName",maybeAuthenticated, getTalkFromName)

router.put("/talk/join", isAuthenticated, joinTalk);

router.patch("/talk/leave", isAuthenticated, leaveTalk);

router.get("/talk/username/:username", maybeAuthenticated, getUserTalks);

router.get(
  "/talk/suggested-popular",
  maybeAuthenticated,
  popularAndSuggestedTalks
);

router.post("/event", isAuthenticated, eventValidator, createEvent)

router.get("/event/all", maybeAuthenticated, getAllEvents)

router.get("/event/id/:eventId", maybeAuthenticated, getEventFromId)

router.put("/event/rsvp/:eventId", isAuthenticated, rsvpEvent)

router.patch("/event/rsvp/:eventId", isAuthenticated, removeRsvp)

router.delete("/event/:eventId", isAuthenticated, deleteEvent)

router.patch("/event/edit/:eventId", isAuthenticated, eventValidator, editEvent)

router.get("/network/search", isAuthenticated, searchForAnything)

module.exports = router;
