const { Notification } = require("../models/notification");
const User = require("../models/user");
const { checkForMentionedUser } = require("./help-functions");

exports.notifyLike = async (userId, post) => {
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
  notification.name = loggedUser.name;
  notification.count = post.likes.length - 1;
  notification.seen = false;
  notification.postBody = post.body;
  notification.save();
};

exports.notifyComment = async (userId, post) => {
  const loggedUser = await User.findById(userId);
  let notification = await Notification.findOne({
    postId: post.id,
    userId: post.author.id,
    class: "comment",
  });

  if (!notification) {
    notification = new Notification({
      postId: post.id,
      userId: post.author.id,
      class: "comment",
    });
  }

  notification.username = loggedUser.username;
  notification.name = loggedUser.name;
  notification.count = post.comments.length - 1;
  notification.seen = false;
  notification.postBody = post.body;
  notification.save();
};

exports.notifyMention = async (body, postAuthorId, location, postId) => {
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
          username: postAuthor.username,
          seen: false,
        });
        notification.save();
      }
    }
  });
};
