const { Router } = require("express");

const {
  getReset,
  updatePassword,
  verifyToken,
} = require("../controllers/password-reset");

const router = Router();

router.get("/get-token", getReset);

router.post("/verify-token", verifyToken);

router.patch("/update-password", updatePassword);

module.exports = router;
