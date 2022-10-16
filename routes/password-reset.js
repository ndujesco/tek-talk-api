const { Router } = require("express");

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
module.exports = router;

router.post("/post-talk", async (req, res) => {
  // const
});
