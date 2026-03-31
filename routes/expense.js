const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");

// Show add-expense form
router.get("/:id/add-expense", expenseController.showAddExpenseForm);

// Handle expense creation
router.post("/:id/expenses", expenseController.addExpense);

// Delete expense
router.post("/:id/expenses/:expenseId/delete", expenseController.deleteExpense);

module.exports = router;