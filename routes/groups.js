const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupController");

router.get("/new", (req, res) => {
  res.render("newgroup");
});

router.post("/", groupController.createGroup);

router.get("/:id", groupController.viewGroup);

router.get("/:id/add-member", groupController.addmemberForm);

router.post("/:id/members", groupController.addMember);

router.post("/:id/delete", groupController.deleteGroup);


module.exports = router;