// src/controllers/dashboardController.js
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const { success } = require('../utils/apiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Totals
    const [incomeAgg, expenseAgg] = await Promise.all([
      Income.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalIncome = incomeAgg[0]?.total || 0;
    const totalExpense = expenseAgg[0]?.total || 0;
    const balance = totalIncome - totalExpense;

    // Budget remaining
    const budgets = await Budget.find({ user: userId });
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    const budgetRemaining = Math.max(totalBudgeted - totalExpense, 0);

    // Expense breakdown by category (for pie chart)
    const expenseByCategory = await Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', amount: { $sum: '$amount' } } },
      { $project: { category: '$_id', amount: 1, _id: 0 } },
      { $sort: { amount: -1 } },
    ]);

    // Income by source (for bar chart)
    const incomeBySource = await Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$source', amount: { $sum: '$amount' } } },
      { $project: { source: '$_id', amount: 1, _id: 0 } },
      { $sort: { amount: -1 } },
      { $limit: 8 },
    ]);

    // Recent activity (last 10 mixed)
    const [recentExpenses, recentIncomes] = await Promise.all([
      Expense.find({ user: userId }).sort({ date: -1 }).limit(5).lean(),
      Income.find({ user: userId }).sort({ date: -1 }).limit(5).lean(),
    ]);

    const recentTransactions = [
      ...recentExpenses.map((e) => ({ ...e, type: 'expense' })),
      ...recentIncomes.map((i) => ({ ...i, type: 'income' })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    return success(res, 200, 'Dashboard data fetched', {
      totalIncome,
      totalExpense,
      balance,
      budgetRemaining,
      expenseByCategory,
      incomeBySource,
      recentTransactions,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };