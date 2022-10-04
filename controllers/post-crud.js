const { body, validationResult } = require("express-validator");
const { uploadFile } = require("../utils/cloudinary");

exports.postPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  try {
    const { body, category, authorId } = req.body;
    console.log(req.body);
    // console.log(req.files);
    const uploadedImages = req.files;
    uploadedImages.forEach((imgData) => {
      console.log(imgData);
      uploadFile(imgData.path);
    });

    res.json({ message: "Success!" });
  } catch (err) {}
};
