const { body } = require("express-validator");

exports.postPost = async (req, res) => {
  try {
    const { body, category, author } = req.body;
    console.log(req.body);
    console.log(req.files);
    res.json({ message: "Success!" });
  } catch (err) {}
};
