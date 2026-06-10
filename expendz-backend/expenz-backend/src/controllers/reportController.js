// src/controllers/reportController.js
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const { success, error } = require('../utils/apiResponse');

/**
 * Helper: Build date filter
 */
const buildDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) filter.$lte = new Date(endDate);
  return Object.keys(filter).length ? { date: filter } : {};
};

/**
 * POST /api/reports/generate
 * Body: { type, startDate, endDate }
 */
const generateReport = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.body;
    const userId = req.user._id;

    if (!type) return error(res, 400, 'Report type is required');

    const dateFilter = buildDateFilter(startDate, endDate);
    const baseQuery = { user: userId, ...dateFilter };

    let report = { type, startDate, endDate };

    // ─── EXPENSE SUMMARY ───
    if (type === 'expense-summary') {
      const expenses = await Transaction.find(baseQuery).sort({ date: -1 });

      const items = expenses.map((e) => ({
        date: e.date.toISOString().split('T')[0],
        description: e.description,
        category: e.category,
        amount: e.amount,
      }));

      const total = items.reduce((sum, i) => sum + i.amount, 0);

      report.items = items;
      report.summary = {
        'Total Expenses': total,
        'Transaction Count': items.length,
        'Average': items.length ? (total / items.length).toFixed(2) : 0,
      };
    }

    // ─── INCOME SUMMARY ───
    else if (type === 'income-summary') {
      const incomes = await Income.find(baseQuery).sort({ date: -1 });

      const items = incomes.map((i) => ({
        date: i.date.toISOString().split('T')[0],
        source: i.source,
        category: i.category,
        amount: i.amount,
      }));

      const total = items.reduce((sum, i) => sum + i.amount, 0);

      report.items = items;
      report.summary = {
        'Total Income': total,
        'Record Count': items.length,
        'Average': items.length ? (total / items.length).toFixed(2) : 0,
      };
    }

    // ─── BUDGET VS ACTUAL ───
    else if (type === 'budget-vs-actual') {
      const budgets = await Budget.find({ user: userId });

      const items = await Promise.all(
        budgets.map(async (b) => {
          const result = await Transaction.aggregate([
            { $match: { user: userId, category: b.category } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
          ]);
          const spent = result[0]?.total || 0;
          return {
            category: b.category,
            budgeted: b.amount,
            spent,
            remaining: b.amount - spent,
            status: spent > b.amount ? 'Over Budget' : 'Within Budget',
          };
        })
      );

      const totalBudgeted = items.reduce((s, i) => s + i.budgeted, 0);
      const totalSpent = items.reduce((s, i) => s + i.spent, 0);

      report.items = items;
      report.summary = {
        'Total Budgeted': totalBudgeted,
        'Total Spent': totalSpent,
        'Remaining': totalBudgeted - totalSpent,
      };
    }

    // ─── JOURNAL (all transactions mixed) ───
    else if (type === 'journal') {
      const expenses = await Transaction.find(baseQuery);
      const incomes = await Income.find(baseQuery);

      const items = [
        ...expenses.map((e) => ({
          date: e.date.toISOString().split('T')[0],
          type: 'Expense',
          description: e.description,
          category: e.category,
          amount: -e.amount,
        })),
        ...incomes.map((i) => ({
          date: i.date.toISOString().split('T')[0],
          type: 'Income',
          description: i.source,
          category: i.category,
          amount: i.amount,
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      const totalIn = incomes.reduce((s, i) => s + i.amount, 0);
      const totalOut = expenses.reduce((s, e) => s + e.amount, 0);

      report.items = items;
      report.summary = {
        'Total Income': totalIn,
        'Total Expense': totalOut,
        'Net': totalIn - totalOut,
        'Entry Count': items.length,
      };
    }

    // ─── INCOME SOURCES BREAKDOWN ───
    else if (type === 'income-sources') {
      const sources = await Income.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$source',
            amount: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
      ]);

      const items = sources.map((s) => ({
        source: s._id,
        records: s.count,
        amount: s.amount,
      }));

      const total = items.reduce((sum, i) => sum + i.amount, 0);

      report.items = items;
      report.summary = {
        'Total Income': total,
        'Unique Sources': items.length,
      };
    }

    else {
      return error(res, 400, 'Invalid report type');
    }

    return success(res, 200, 'Report generated', { report });
  } catch (err) {
    next(err);
  }
};

module.exports = { generateReport };