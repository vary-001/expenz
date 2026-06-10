// src/controllers/dashboardController.js
const Transaction = require('../models/Transaction');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const { success, error } = require('../utils/apiResponse');

const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const incomeAgg = await Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalIncome = incomeAgg[0]?.total || 0;

    const expenseAgg = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalExpense = expenseAgg[0]?.total || 0;

    const expenseByCategory = await Transaction.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $project: { category: '$_id', amount: '$total', _id: 0 } },
      { $sort: { amount: -1 } },
    ]);

    const incomeBySource = await Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$source', amount: { $sum: '$amount' } } },
      { $project: { source: '$_id', amount: 1, _id: 0 } },
      { $sort: { amount: -1 } },
    ]);

    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1 })
      .limit(10)
      .select('description amount category date type');

    // Calculate total budget remaining
    const budgets = await Budget.find({ user: userId });
    const budgetsWithRemaining = await Promise.all(
      budgets.map(async (b) => {
        const resAgg = await Transaction.aggregate([
          { $match: { user: userId, category: b.category } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const spent = resAgg[0]?.total || 0;
        return Math.max(b.amount - spent, 0);
      })
    );
    const budgetRemaining = budgetsWithRemaining.reduce((s, n) => s + n, 0);

    return success(res, 200, 'Dashboard fetched', {
      totalIncome,
      totalExpense,
      expenseByCategory,
      incomeBySource,
      recentTransactions,
      budgetRemaining,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };