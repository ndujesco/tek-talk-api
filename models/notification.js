const { Schema, default: mongoose } = require("mongoose");

const notificationSchema = new Schema({
  class: String,
  seen: Boolean,
  theId: String,
  name: String,
  count: Number,
});

exports.Notification = mongoose.model("Notification", notificationSchema);
