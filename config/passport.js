const passport = require("passport");
const User = require("../models/user");

function passportConfig() {
  passport.use(User.createStrategy());
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
  return passport;
}

module.exports = passportConfig;