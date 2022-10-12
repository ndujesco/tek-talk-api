const { Notification } = require("../models/notification");
const { catchError } = require("../utils/help-functions");

exports.getNotifications = async (req, res) => {
  try {
    const userNotifications = await Notification.find({ userId: req.userId });
    res.status(200).json({ userNotifications });
  } catch (err) {
    catchError(err, res);
  }
};
