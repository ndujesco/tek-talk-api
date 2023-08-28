const { validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");

const Message = require("../models/message");
const { catchError } = require("../utils/help-functions");

const {
  uploadDmToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const io = require("../socket");

const modifyMessages = (messages, host, loggedUserId) => {
  return messages.map((message) => {
    const { username, displayUrl, id } = message.senderId;

    return {
      id: message.id,
      text: message.text,
      updatedAt: message.updatedAt.toString(),
      createdAt: message.createdAt.toString(),
      status: message.senderId.id === loggedUserId ? "sender" : "receiver",
      seen: message.seen,
      sender: { id, displayUrl, username },
      imagesUrl:
        message.imagesUrl.length > 0
          ? message.imagesUrl
          : message.imagesLocal.map((image) => `https://${host}/${image}`),
    };
  });
};

exports.postMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  if (!req.body.text && (!req.files || !req.files.image))
    return res
      .status(422)
      .json({ status: 422, message: "The two input fields cannot be empty." });

  try {
    const { text } = req.body;
    const { receiverId } = req.params;

    const uniquifiedRoomName = `${req.userId} ${receiverId}`
      .split(" ")
      .sort((a, b) => (a > b ? 1 : -1))
      .join("-and-");


    const message = await new Message({
      receiverId,
      text,
      imagesId: [],
      imagesLocal: [],
      imagesUrl: [],
      senderId: req.userId,
      seen: (await io.getIO().fetchSockets())
        .map((socket) => socket.rooms)
        .some((set) => set.has(uniquifiedRoomName) && set.has(receiverId)),
    }).populate({
      model: "User",
      path: "senderId",
      select: { displayUrl: 1, username: 1 },
    });

    const uploadedImages = req.files.image || []; //important
    if (uploadedImages.some((imgData) => imgData.size > 10485760))
      return res.status(422).json({
        status: 422,
        message: "Brutha, this file laarge.",
      });
    uploadedImages.forEach((imgData) => {
      const imageLocalPath = imgData.path.replace("\\", "/");
      message.imagesLocal.push(imageLocalPath);
    });

    await message.save();

    io.getIO()
      .to(uniquifiedRoomName)
      .except(req.userId)
      .emit(
        "onNewMessage",
        modifyMessages([message], req.headers.host, receiverId)[0]
      );

    uploadDmToCloudinary(
      uploadedImages.map((file) => file.path),
      message.id
    );
    res.status(200).json({
      status: 200,
      message: "Sent successfully!",
      messageId: message.id,
    });
  } catch (err) {
    catchError(err, res);
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  if (!isValidObjectId(messageId))
    return res.status(401).json({ message: "Invalid credentials" });
  try {
    const message = await Message.findById(messageId).populate({
      model: "User",
      path: "senderId",
      select: { displayUrl: 1, username: 1 },
    });

    if (!message || message.senderId.id !== req.userId)
      return res.status(401).json({ message: "Invalid credentials" });

    await message.delete();

    const uniquifiedRoomName = `${message.senderId.id} ${message.receiverId}`
      .split(" ")
      .sort((a, b) => (a > b ? 1 : -1))
      .join("-and-");

    io.getIO()
      .to(uniquifiedRoomName)
      .except(req.userId)
      .emit(
        "onDelete",
        modifyMessages([message], req.headers.host, message.receiverId)[0]
      );

    message.imagesId.forEach((id) => {
      deleteFromCloudinary(id);
    });
    res.status(200).json({ messageId: message.id });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getDirectMessages = async (req, res) => {
  const { otherUserId } = req.params;

  if (!isValidObjectId(otherUserId) || req.userId === otherUserId)
    return res.status(401).json({ message: "Invalid credentials" });

  try {
    await Message.updateMany(
      {
        $and: [
          { receiverId: req.userId },
          { senderId: otherUserId },
          { seen: false },
        ],
      },
      { seen: true }
    );
    let messages = await Message.find({
      $or: [
        { $and: [{ senderId: req.userId }, { receiverId: otherUserId }] },
        { $and: [{ senderId: otherUserId }, { receiverId: req.userId }] },
      ],
    }).populate({
      path: "senderId",
      model: "User",
      select: { displayUrl: 1, username: 1 },
    });

    messages = modifyMessages(messages, req.headers.host, req.userId);

    res.status(200).json({ messages });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getChats = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ senderId: req.userId }, { receiverId: req.userId }],
    })
      .populate({
        path: "senderId",
        model: "User",
        select: { displayUrl: 1, username: 1, verified: 1, name: 1 },
      })
      .populate({
        path: "receiverId",
        model: "User",
        select: { displayUrl: 1, username: 1, verified: 1, name: 1 },
      });

    let keepTrackArray = [];
    let keepTrackObj = {};

    for (i = messages.length - 1; i > -1; i--) {
      const message = messages[i];
      const otherUserId =
        message.senderId.id === req.userId
          ? message.receiverId.id
          : message.senderId.id;

      if (!keepTrackObj[otherUserId]) {
        message.unread = 0;
        keepTrackArray.push(otherUserId);
        keepTrackObj[otherUserId] = message;
      }
      if (!message.seen && message.receiverId.id === req.userId) {
        keepTrackObj[otherUserId].unread += 1;
      }
    }

    keepTrackArray = keepTrackArray.map((id) => {
      const message = keepTrackObj[id];
      const user =
        message.senderId.id === req.userId
          ? message.receiverId
          : message.senderId;

      return {
        text: message.text,
        id: user.id,
        username: user.username,
        name: user.name,
        displayUrl: user.displayUrl,
        isVerified: user.verified,
        time: message.createdAt.toString(),
        status: message.senderId.id === req.userId ? "sender" : "receiver",
        unread: message.unread,
      };
    });

    res.status(200).json({ chats: keepTrackArray });
  } catch (err) {
    catchError(err, res);
  }
};
