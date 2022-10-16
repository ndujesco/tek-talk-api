const { Router } = require("express");

const Talk = require("../models/talk");

const {
  getReset,
  updatePassword,
  verifyToken,
  changePassword,
} = require("../controllers/password-reset");

const { isAuthenticated } = require("../middleware/is-auth");

const router = Router();

router.get("/get-token", getReset);

router.post("/verify-token", verifyToken);

router.patch("/update-password", updatePassword);

router.patch("/change-password", isAuthenticated, changePassword);

router.post("/post-talk", async (req, res) => {
  const { name, description, displayUrl } = req.body;
  if (!name || !description || !displayUrl)
    return res
      .status(422)
      .json({ status: 422, message: "Some fields missing boss" });

  const talk = new Talk({ ...req.body });
  talk.save();
});

module.exports = router;
