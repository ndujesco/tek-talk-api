exports.postComment = async (req, res) => {
  const userId = req.userId;
  console.log(req.body);
  res.json({ message: "Yayyy!" });
};
