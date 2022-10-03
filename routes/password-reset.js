const { Router } = require("express");

const { query } = require("express-validator");
const { getReset, updatePassword } = require("../controllers/password-reset");

const router = Router();

router.get("/get-token", getReset);

router.patch(
  "/update-password",
  [
    query("newPassword", "Passwords must have a minimum of 5 characters")
      .isLength({ min: 5 })
      .trim(),
    query("confirmPassword", "Passwords must have a minimum of 5 characters")
      .custom((value, { req }) => {
        if (!value) {
          throw new Error("Fill the 'confirmPassword' field.");
        }
        if (value.toString() !== req.body.newPassword.toString()) {
          throw new Error("Passwords have to match!");
        }
        return true;
      })
      .trim(),
  ],
  updatePassword
);

module.exports = router;
