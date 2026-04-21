const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/authController");

// Local login/register/logout
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/logout", authController.logout);

// Google login
router.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful login → redirect to dashboard
    res.redirect("/dashboard");
  }
);

module.exports = router;