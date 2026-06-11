// src/controllers/budgetController.js
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { success, error } = require('../utils/apiResponse');

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthRange = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return { start, end };
};

const calculateSpent = async (userId, category, month) => {
  const { start, end } = getMonthRange(month);
  const result = await Expense.aggregate([
    {
      $match: {
        user: userId,
        category: category.toLowerCase(),
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result[0]?.total || 0;
};

/**
 * GET /api/budgets
 * Get all budgets for current month (or specified month via ?month=YYYY-MM)
 */
const getAllBudgets = async (req, res, next) => {
  try {
    const month = req.query.month || getCurrentMonth();

    const budgets = await Budget.find({ user: req.user._id, month }).sort({ createdAt: -1 });

    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await calculateSpent(req.user._id, budget.category, budget.month);
        return {
          ...budget.toObject(),
          spent,
          remaining: Math.max(budget.amount - spent, 0),
          percentageUsed: budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0,
          isOverBudget: spent > budget.amount,
        };
      })
    );

    return success(res, 200, 'Budgets fetched', { budgets: budgetsWithSpent, month });
  } catch (err) {
    next(err);
  }
};

const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) return error(res, 404, 'Budget not found');
    return success(res, 200, 'Budget fetched', { budget });
  } catch (err) {
    next(err);
  }
};

const createBudget = async (req, res, next) => {
  try {
    const { category, amount, incomeSource } = req.body;
    const month = req.body.month || getCurrentMonth();

    if (!category || !amount) return error(res, 400, 'Category and amount are required');
    if (amount <= 0) return error(res, 400, 'Amount must be greater than 0');

    const existing = await Budget.findOne({
      user: req.user._id,
      category: category.toLowerCase(),
      month,
    });

    if (existing) {
      return error(res, 409, `Budget for "${category}" already exists this month`);
    }

    const budget = await Budget.create({
      user: req.user._id,
      category: category.toLowerCase().trim(),
      amount: parseFloat(amount),
      month,
      incomeSource: incomeSource || '',
    });

    return success(res, 201, 'Budget created successfully', { budget });
  } catch (err) {
    next(err);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!budget) return error(res, 404, 'Budget not found');

    const { amount, incomeSource } = req.body;
    if (amount !== undefined) {
      if (amount <= 0) return error(res, 400, 'Amount must be greater than 0');
      budget.amount = parseFloat(amount);
    }
    if (incomeSource !== undefined) budget.incomeSource = incomeSource;

    await budget.save();
    return success(res, 200, 'Budget updated', { budget });
  } catch (err) {
    next(err);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!budget) return error(res, 404, 'Budget not found');
    return success(res, 200, 'Budget deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBudgets, getBudget, createBudget, updateBudget, deleteBudget };