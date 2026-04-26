const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");

router.get("/:id/add-expense", expenseController.showAddExpenseForm);

router.post("/:id/expenses", expenseController.addExpense);

router.post("/:id/expenses/:expenseId/delete", expenseController.deleteExpense);

module.exports = router;