const Event  = require("../models/event")
const { Notification } = require("../models/notification");
const User = require("../models/user");
const { catchError } = require("../utils/help-functions");

const dayBeforeNotification = 24 * 3600 * 1000;


exports.getNotifications = async (req, res) => {
  try {
    const events = await Event.find();
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
    });

    let usersEventsToNotify = events.filter(event => {
      return event.attendees.includes(req.userId) && new Date(event.startTime).getTime() <= Date.now() + dayBeforeNotification
    })
    usersEventsToNotify = usersEventsToNotify.map(event => { 
      return {
        name: event.name,
        displayUrl: event.imageUrl,
        startTime: event.startTime,
        endTime: event.endTime,
        class: "event", 
        updatedAt: new Date(new Date(event.startTime).getTime() - dayBeforeNotification),
        description: event.description
      }
    })
    console.log(usersEventsToNotify);
    
    userNotifications.push(...usersEventsToNotify)
    userNotifications.sort((a, b) => {
      return a.updatedAt > b.updatedAt ? -1 : 1
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

