const User = require("../models/user");   
const passport = require("passport");


exports.getLogin = (req, res) => {
  res.render("login");   
};

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


exports.getRegister = (req, res) => {
  res.render("register"); 
};

exports.postRegister = async (req, res, next) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

  
    if (password !== confirmPassword) {
      req.flash("error", "Passwords do not match");
      return res.redirect("/register");
    }

    const newUser = new User({ username, email });
    await User.register(newUser, password); 

    
    req.login(newUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Account created successfully! Welcome, " + newUser.username + "!");
      return res.redirect("/dashboard");
    });
  } catch (err) {
    console.error(err);

  
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      req.flash("error", "Email already registered. Please log in instead.");
    } else {
      req.flash("error", "Registration failed: " + err.message);
    }

    res.redirect("/register");
  }
};


exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) { return next(err); }
    req.flash("success", "Logged out successfully!");
    res.redirect("/");
  });
};