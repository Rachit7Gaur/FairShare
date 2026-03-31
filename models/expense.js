const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: { type: String, required: true },   
  amount: { type: Number, required: true },        
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true }, 
  date: { type: Date, default: Date.now },
  splitAmong: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }]
});

module.exports = mongoose.model('Expense', expenseSchema);