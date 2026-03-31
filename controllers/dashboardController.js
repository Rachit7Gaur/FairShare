const Group = require("../models/group");

// Show user dashboard
exports.getDashboard = async (req, res) => {
  try {
   
    const userGroups = await Group.find({ members: req.user._id });

    res.render("dashboard", {
      title: "Dashboard",
      layout: "layout",
      user: req.user,
      userGroups
    });
  } catch (err) {
    console.error("Error loading dashboard:", err);
    req.flash("error", "Failed to load dashboard");
    res.redirect("/login");
  }
};