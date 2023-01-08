const { Notification } = require("../models/notification");
const { catchError } = require("../utils/help-functions");

exports.getNotifications = async (req, res) => {
  try {
    const userNotifications = await Notification.find({
      userId: req.userId,
    }).sort({ updatedAt: -1 });
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

