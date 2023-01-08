const { Notification } = require("../models/notification");
const User = require("../models/user");
const { catchError } = require("../utils/help-functions");

exports.getNotifications = async (req, res) => {
  try {
    let userNotifications = await Notification.find({
      userId: req.userId,
    }).sort({ updatedAt: -1 }).populate({path: "loggedUserId", model: "User" })

    userNotifications = userNotifications.map(notification => {
      const toReturn = notification;
      if (notification.loggedUserId) {
        toReturn.username = notification.loggedUserId.username;
        toReturn.name = notification.loggedUserId.name;
        toReturn.displayUrl = notification.loggedUserId.displayUrl || null;
        toReturn.loggedUserId = notification.loggedUserId.id;
      }
      return toReturn 
    })
    res.status(200).json({ userNotifications });
  } catch (err) {
    catchError(err, res);
  }
};

exports.readNotifications = async (req, res) => {
  try {
    const userNotifications = await Notification.find({ userId: req.userId });
    userNotifications.forEach((notification) => {
      notification.seen = true;
      notification.save();
    });
    res.status(200).json({ userNotifications });
  } catch (err) {
    catchError(err, res);
  }
};

