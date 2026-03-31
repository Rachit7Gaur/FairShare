const mongoose = require("mongoose");
const Group = require("../models/group");
const User = require("../models/user");
const { calculateBalances, minimizeSettlements } = require("../utils/settlements");

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    // validation
    if (!name || name.trim() === "") {
      req.flash("error", "Group name cannot be empty.");
      return res.redirect("/groups/new");
    }

    // create group with owner and initial member
    const group = new Group({
      name,
      owner: req.user._id,
      members: [req.user._id]
    });

    await group.save();

    req.flash("success", "Group created successfully!");
    res.redirect(`/groups/${group._id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to create group: " + err.message);
    res.redirect("/dashboard");
  }
};

// View group details
exports.viewGroup = async (req, res) => {
  try {
    const id = req.params.id;

    // validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send("Invalid group ID");
    }

    // find group and populate relations
    const group = await Group.findById(id)
      .populate("owner")
      .populate("members")
      .populate({
        path: "expenses",
        populate: [{ path: "paidBy" }, { path: "splitAmong" }]
      });

    if (!group) {
      return res.status(404).send("Group not found");
    }

    // calculate balances and settlements
    const balances = calculateBalances(group.expenses, group.members);
    const settlements = minimizeSettlements(balances, group.members);

    // fetch all users (for adding members)
    const allUsers = await User.find({});

    res.render("groupDetails", {
      layout: "layout",
      group,
      expenses: group.expenses,
      allUsers,
      balances,
      settlements
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

// Add a member to group
exports.addmemberForm =  async (req, res) => {
  const group = await Group.findById(req.params.id).populate("members");
  const allUsers = await User.find({});
  res.render("addMember", { group, allUsers });
};


exports.addMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const user = await User.findOne({ username: req.body.username });

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect(`/groups/${req.params.id}`);
    }

    group.members.push(user._id);
    await group.save();

    req.flash("success", "Member added successfully!");
    res.redirect(`/groups/${req.params.id}`);
  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to add member");
    res.redirect(`/groups/${req.params.id}`);
  }
};
