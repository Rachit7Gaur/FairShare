const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

router.get("/edit", profileController.renderEditForm);
router.post("/edit", profileController.updateProfile);

module.exports = router;