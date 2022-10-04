const { Router } = require("express");
const {
  getIndex,
  getUserProfile,
  getMyProfile,
  getUserProfileFromId,
} = require("../controllers/crud");
const { isAuthenticated } = require("../middleware/is-auth");

const router = Router();

router.get("/", isAuthenticated, getIndex);

router.get("/profile", isAuthenticated, getMyProfile);

router.get("/profile/:username", getUserProfile);

router.get("/profile/id/:id", getUserProfileFromId);

router.get("/sample", (req, res) => {
  const { token } = req.query;
  res.json({ message: "Sample page", token });
});

module.exports = router;
