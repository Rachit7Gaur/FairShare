const Group = require("../models/group");
const Expense = require("../models/expense");
const User = require("../models/user");

// Show add-expense form
exports.showAddExpenseForm = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate("members");
    if (!group) {
      req.flash("error", "Group not found!");
      return res.redirect("/dashboard");
    }
    res.render("addExpense", { layout: "layout", group });
  } catch (err) {
    console.error("Error loading add-expense form:", err);
    req.flash("error", "Failed to load expense form");
    res.redirect("/dashboard");
  }
};

// Add a new expense
exports.addExpense = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      req.flash("error", "Group not found!");
      return res.redirect("/groups");
    }

    const { description, amount, paidBy, splitAmong } = req.body;

    const expense = new Expense({
      description,
      amount,
      paidBy,
      group: group._id,
      splitAmong: Array.isArray(splitAmong) ? splitAmong : [splitAmong]
    });

    await expense.save();

    group.expenses.push(expense._id);
    await group.save();

    req.flash("success", "Expense added successfully!");
    res.redirect(`/groups/${group._id}`);
  } catch (err) {
    console.error("Error adding expense:", err);
    req.flash("error", "Something went wrong while adding expense.");
    res.redirect(`/groups/${req.params.id}`);
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id, expenseId } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      req.flash("error", "Group not found!");
      return res.redirect("/groups");
    }

    const expense = await Expense.findById(expenseId).populate("paidBy");
    if (!expense) {
      req.flash("error", "Expense not found!");
      return res.redirect(`/groups/${id}`);
    }

    // Authorization check: only the payer can delete
    if (expense.paidBy._id.toString() !== req.user._id.toString()) {
      req.flash("error", "You can only delete expenses you paid for!");
      return res.redirect(`/groups/${id}`);
    }

    // Remove expense reference from group
    group.expenses = group.expenses.filter(e => e.toString() !== expenseId);
    await group.save();

    // Delete expense document
    await Expense.findByIdAndDelete(expenseId);

    req.flash("success", "Expense deleted successfully!");
    res.redirect(`/groups/${id}`);
  } catch (err) {
    console.error("Error deleting expense:", err);
    req.flash("error", "Something went wrong while deleting expense.");
    res.redirect(`/groups/${req.params.id}`);
  }
};
