const User = require("../models/user");   // your User model
const passport = require("passport");

// GET login page
exports.getLogin = (req, res) => {
  res.render("login");   // renders login.ejs
};

// POST login
exports.postLogin = (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error", info.message || "Invalid username or password");
      return res.redirect("/login");
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome back, " + user.username + "!");
      return res.redirect("/dashboard");
    });
  })(req, res, next);
};


// GET register page
exports.getRegister = (req, res) => {
  res.render("register"); 
};

// POST register
exports.postRegister = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // check if passwords match
    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    // create new user
    const newUser = new User({ username, email });
    await User.register(newUser, password); // passport-local-mongoose helper

    // log the user in immediately after registration
    req.login(newUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Account created successfully! Welcome, " + newUser.username + "!");
      return res.redirect("/dashboard");
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Registration failed: " + err.message);
    res.redirect("/register");
  }
};


// GET logout
exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) { return next(err); }
    req.flash("success", "Logged out successfully!");
    res.redirect("/");
  });
};