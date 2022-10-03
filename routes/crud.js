const { Router } = require("express");
const { getIndex } = require("../controllers/crud");
const { isAuthorized, isAuthenticated } = require("../middleware/is-auth");

const router = Router();

router.get("/", isAuthenticated, getIndex);

router.get("/sample", (req, res) => {
  const { token } = req.query;
  res.json({ message: "Sample page", token });
});

module.exports = router;
