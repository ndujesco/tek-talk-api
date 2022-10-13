const { Schema, default: mongoose } = require("mongoose");

const notificationSchema = new Schema({
  class: String, //like, comment, follow, mention
  mentionLocation: String,
  seen: Boolean,
  postId: String,
  userId: String,
  postId: String,
  username: String,
  name: String,
  count: { type: Number, default: 0 },
  loggedUserId: String,
  postBody: String,
  commentBody: String,
  followersId: [String],
  commentId: String,
});

exports.Notification = mongoose.model("Notification", notificationSchema);
