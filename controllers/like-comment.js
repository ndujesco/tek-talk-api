const { isValidObjectId } = require("mongoose");
const Comment = require("../models/comment");

exports.postComment = async (req, res) => {
  const userId = req.userId;
  const { postId: post, body } = req.body;
  console.log(post, body);

  const isValid = isValidObjectId(post);

  try {
    if (!isValid) {
      const error = new Error("Errmm. postId is a invalid ");
      error.statusCode = 401;
      throw error;
    }
    const comment = await Comment({});
    res.json({ message: "Yayyy!" });
  } catch (err) {
    catchError(err, res);
  }
};
