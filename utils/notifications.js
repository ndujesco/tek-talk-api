const { Notification } = require("../models/notification");
const User = require("../models/user");

const { checkForMentionedUser } = require("./help-functions");

exports.notifyLike = async (userId, post) => {
  if (userId !== post.author.id) {
    const loggedUser = await User.findById(userId);
    let notification = await Notification.findOne({
      postId: post.id,
      userId: post.author.id,
      class: "like",
    });

    if (!notification) {
      notification = new Notification({
        postId: post.id,
        userId: post.author.id,
        class: "like",
      });
    }

    notification.username = loggedUser.username;
    notification.loggedUserId = loggedUser.id;
    notification.name = loggedUser.name;
    notification.count = post.likes.length - 1;
    notification.seen = false;
    notification.postBody = post.body;
    notification.displayUrl = loggedUser.displayUrl;
    notification.save();
  }
};

exports.notifyComment = async (userId, post, commentId) => {
  if (userId !== post.author.id) {
    const loggedUser = await User.findById(userId);
    let notification = await Notification.findOne({
      postId: post.id,
      userId: post.author.id,
      class: "comment",
      commentId,
    });

    if (!notification) {
      notification = new Notification({
        postId: post.id,
        userId: post.author.id,
        class: "comment",
        commentId,
      });
    }

    notification.username = loggedUser.username;
    notification.loggedUserId = loggedUser.id;
    notification.name = loggedUser.name;
    notification.count = post.comments.length - 1;
    notification.seen = false;
    notification.postBody = post.body;
    notification.displayUrl = loggedUser.displayUrl;

    await notification.save();
  }
};

exports.notifyMention = async (
  body,
  postAuthorId,
  location,
  postId,
  commentId,
  postedIn
) => {
  const users = await User.find();

  const mentions = checkForMentionedUser(body, users);
  mentions.forEach(async (username) => {
    const postAuthor = await User.findById(postAuthorId);
    const toNotify = await User.findOne({ username });
    if (postAuthor) {
      if (postAuthor.id !== toNotify.id) {
        const notification = new Notification({
          postId,
          userId: toNotify.id,
          class: "mention",
          mentionLocation: location,
          postBody: body,
          name: postAuthor.name,
          loggedUserId: postAuthor.id,
          username: postAuthor.username,
          seen: false,
          commentId: location === "comment" ? commentId : null,
          postedIn: location === "post" ? postedIn : null,
          displayUrl: postAuthor.displayUrl,
        });
        notification.save();
      }
    }
  });
};

exports.notifyFollow = async (userToFollow, loggedInUser) => {
  let notification = await Notification.findOne({
    class: "follow",
    userId: userToFollow.id,
    count: { $lte: 5 },
  });

  if (!notification) {
    notification = new Notification({
      userId: userToFollow.id,
      class: "follow",
      count: 0,
      followersId: [],
    });
  }
  if (notification.followersId.includes(loggedInUser.id)) {
    const position = notification.followersId.indexOf(loggedInUser.id)
    notification.followersId.splice(position, 1)
  }
    notification.username = loggedInUser.username;
    notification.loggedUserId = loggedInUser.id
    notification.name = loggedInUser.name;
    notification.displayUrl = loggedInUser.displayUrl;
    notification.count = notification.followersId.length
    notification.seen = false;
    notification.followersId.push(loggedInUser.id);

  notification.save();
};
