const User = require("../models/user");

module.exports.renderEditForm = (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.render("edit", { user: req.user });
};

module.exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    // Update user by _id and return the updated document
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { username, email },
      { new: true, runValidators: true } // ensures updated doc is returned and validation runs
    );

    if (!updatedUser) {
      req.flash("error", "User not found.");
      return res.redirect("/profile/edit");
    }

    // Refresh session with updated user
    req.login(updatedUser, (err) => {
      if (err) {
        console.error(err);
        req.flash("error", "Could not refresh session.");
        return res.redirect("/profile/edit");
      }
      req.flash("success", "Profile updated successfully!");
      res.redirect("/dashboard");
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Could not update profile.");
    res.redirect("/profile/edit");
  }
};