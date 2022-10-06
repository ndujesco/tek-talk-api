exports.editProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  res.json({ message: "Oyaaa!" });
  try {
    const { body, category, postedIn } = req.body;
    const post = new Post({
      body,
      category,
      postedIn,
      author: req.userId,
      imagesLocal: [],
      imagesUrl: [],
      imagesId: [],
      comments: [],
      likes: [],
      createdAt: Date.now().toString(),
    });
    const uploadedImages = req.files;
    uploadedImages.forEach((imgData) => {
      const imageLocalPath = imgData.path.replace("\\", "/");
      post.imagesLocal.push(imageLocalPath);
    });
    await post.save();
    res.status(200).json({
      status: 200,
      message: "Posted Successfully!",
      postId: post.id,
    });
    uploadedImages.forEach((imgData) => {
      uploadToCloudinary(imgData.path, post.id);
    });
  } catch (err) {
    catchError(err, res);
  }
};
