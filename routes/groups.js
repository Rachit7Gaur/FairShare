const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

router.get("/new", (req, res) => {
  res.render("newgroup");
});

// Create a new group
router.post("/", groupController.createGroup);

// View individual group details
router.get("/:id", groupController.viewGroup);

// Show add-member form
router.get("/:id/add-member", groupController.addmemberForm);

// Add a member to a group
router.post("/:id/members", groupController.addMember);

module.exports = router;