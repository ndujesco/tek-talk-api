const { Schema, default: mongoose } = require("mongoose");

const notificationSchema = new Schema(
  {
    class: String, //like, comment, follow, mention, event
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
    postedIn: String,
    displayUrl: String,
  },

  {
    timestamps: true,
  }
);
const eventNotificationSchema = new Schema ({
  
})
exports.Notification = mongoose.model("Notification", notificationSchema);
