const { validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");

const Message = require("../models/message");
const { catchError } = require("../utils/help-functions");

const {
  uploadDmToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const io = require("../socket");

const modifyMessages = (messages, senderId) => {
  return messages.map((message) => {
    const { username, displayUrl, id } = message.senderId;
    return {
      id: message.id,
      text: message.text,
      updatedAt: message.updatedAt.toString(),
      createdAt: message.createdAt.toString(),
      status: message.senderId.id === senderId ? "sender" : "receiver",
      seen: message.seen,
      sender: { id, displayUrl, username },
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
    const { text, socketId } = req.body;
    const { receiverId } = req.params;
    const message = new Message({
      receiverId,
      text,
      imagesId: [],
      imagesLocal: [],
      imagesUrl: [],
      senderId: req.userId,
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

    const uniquifiedRoomName = `${req.userId} ${receiverId}`
      .split(" ")
      .sort((a, b) => (a > b ? 1 : -1))
      .join("-and-");
    await message.save();

    io.getIO()
      .except(socketId)
      .to(uniquifiedRoomName)
      .emit(
        "updateMessages",
        modifyMessages(await Message.find({ receiverId, senderId: req.userId }))
      );

    uploadedImages.forEach((imgData) => {
      uploadDmToCloudinary(imgData.path, message.id);
    });

    res.status(200).json({
      status: 200,
      message: "Sent successfully!",
      message: message.id,
    });
  } catch (err) {
    catchError(err, res);
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const { socketId } = req.query;

  if (!isValidObjectId(messageId))
    return res.status(401).json({ message: "iInvalid credentials" });
  try {
    const message = await Message.findById(messageId);

    if (!message || message.senderId !== req.userId)
      return res.status(401).json({ message: "Invalid credentials" });

    await message.delete();

    const uniquifiedRoomName = `${message.senderId} ${message.receiverId}`
      .split(" ")
      .sort((a, b) => (a > b ? 1 : -1))
      .join("-and-");

    io.getIO()
      .except(socketId)
      .to(uniquifiedRoomName)
      .emit(
        "updateMessages",
        modifyMessages(
          await Message.find({
            receiverId: message.receiverId,
            senderId: req.userId,
          })
        )
      );

    message.imagesId.forEach((id) => {
      deleteFromCloudinary(id);
    });
    res.status(200).json({ message: "Bad boy!" });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getDirectMessages = async (req, res) => {
  const { otherUserId } = req.params;

  if (!isValidObjectId(otherUserId))
    return res.status(401).json({ message: "iInvalid credentials" });

  try {
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

    const lastMessage = messages[messages.length - 1];
    lastMessage.seen = true;
    await lastMessage.save();

    messages = modifyMessages(messages, req.userId);
    res.status(200).json({ messages });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getMessages = async (req, res) => {
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

    let messagesToReturn = [];
    let keeptrack = {};

    for (i = messages.length - 1; i > -1; i--) {
      const otherUserId =
        messages[i].senderId.id === req.userId
          ? messages[i].receiverId.id
          : messages[i].senderId.id;

      if (!keeptrack[otherUserId]) {
        messagesToReturn.push(messages[i]);
        keeptrack[otherUserId] = 1;
      }
    }

    messagesToReturn = messagesToReturn.map((message) => {
      const toReturn = {};
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
        seen: message.seen,
      };
    });

    res.status(200).json({ messagesToReturn });
  } catch (err) {
    catchError(err, res);
  }
};
