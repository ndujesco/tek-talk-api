const { Notification } = require("../models/notification");
const User = require("../models/user");
const { catchError } = require("../utils/help-functions");

exports.getNotifications = async (req, res) => {

  // const notifications = await  Notification.find();
  // const users = await User.find()
  // const allUserNames = users.map(user => user.username);

  // const unchangedName = notifications.filter(notification => allUserNames.includes(notification.username))
  // const changedName = notifications.filter(notification => !allUserNames.includes(notification.username))



  // return res.json({allCount: notifications.length, unchangedCount: unchangedName.length, changedCount: changedName.length, changed: changedName })




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

