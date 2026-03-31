const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");

// Show add-expense form
router.get("/:id/add-expense", expenseController.showAddExpenseForm);

// Handle expense creation
router.post("/:id/expenses", expenseController.addExpense);

module.exports = router;