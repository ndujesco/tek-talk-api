const { validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");

const Message = require("../models/message");
const { catchError } = require("../utils/help-functions");

const {
  uploadDmToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const io = require("../socket");

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

    const uniquifiedRoomName = `${user.id} ${receiverId}`
      .split(" ")
      .sort((a, b) => (a > b ? 1 : -1))
      .join("-and-");
    await message.save();
    io.getIO().to(receiverId).emit("newMessage", message);

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

  if (!isValidObjectId(messageId))
    return res.status(401).json({ message: "iInvalid credentials" });
  try {
    const message = await Message.findById(messageId);

    if (message && message.senderId !== req.userId)
      return res.status(401).json({ message: "Invalid credentials" });

    await message.delete();

    io.getIO().emit("deleteMessage", message);

    message.imagesId.forEach((id) => {
      deleteFromCloudinary(id);
    });
    res.status(200).json({ message: "Bad boy!" });
  } catch (err) {
    catchError(err, res);
  }
};

// exports.deletePost = async (req, res) => {
//   const { messageId } = req.query;
//   const isValid = isValidObjectId(postId);

//   if (!isValid) {
//     res.status(422).json({ status: 422, message: "This your id sha" });
//   }

//   try {
//     const post = await Post.findById(postId).populate("author");
//     if (!post) return res.status(200).json({ message: "No post with this id" });
//     const possiblePeople = [
//       post.author.id,
//       "633b45a338ad34f4b8940219",
//       "633dae0b84db7a1a751fe468",
//     ];
//     if (!possiblePeople.includes(req.userId))
//       return res
//         .status(200)
//         .json({ message: "What do you think you're trying to do?" });
//     await Comment.deleteMany({ post: postId });
//     res.status(200).json({ message: "Deleted successfully" });
// post.imagesId.forEach((id) => {
//   deleteFromCloudinary(id);
// });
// //   } catch (err) {
//     catchError(err, res);
//   }
// };
