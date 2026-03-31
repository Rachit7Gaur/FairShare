function calculateBalances(expenses, members) {
  const balances = {};

  // Initialize balances
  members.forEach(member => {
    balances[member._id] = 0;
  });

  expenses.forEach(expense => {
    const share = expense.amount / expense.splitAmong.length;

    expense.splitAmong.forEach(member => {
      if (member._id.toString() !== expense.paidBy._id.toString()) {
        // Member owes their share
        balances[member._id] -= share;
        // PaidBy gets credited
        balances[expense.paidBy._id] += share;
      }
    });
  });

  return balances;
}

function minimizeSettlements(balances, members) {
  const creditors = [];
  const debtors = [];

  members.forEach(member => {
    const balance = balances[member._id];
    if (balance > 0) creditors.push({ member, balance });
    else if (balance < 0) debtors.push({ member, balance: -balance });
  });

  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  const settlements = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.balance, creditor.balance);

    settlements.push({
      from: debtor.member.username,
      to: creditor.member.username,
      amount: Math.round(amount * 100) / 100 // round to 2 decimals
    });

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }

  return settlements;
}

module.exports = {
  calculateBalances,
  minimizeSettlements
};