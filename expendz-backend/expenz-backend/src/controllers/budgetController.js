// src/controllers/budgetController.js
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { success, error } = require('../utils/apiResponse');

/**
 * Helper: Calculate how much was spent in a category within budget period
 */
const calculateSpent = async (userId, category, period) => {
  const now = new Date();
  let startDate;

  if (period === 'weekly') {
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 7);
  } else if (period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (period === 'yearly') {
    startDate = new Date(now.getFullYear(), 0, 1);
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const result = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        category: category.toLowerCase(),
        date: { $gte: startDate, $lte: now },
      },
    },
    {
      $group: { _id: null, total: { $sum: '$amount' } },
    },
  ]);

  return result[0]?.total || 0;
};

/**
 * GET /api/budgets
 * Get all budgets with spent amount calculated
 */
const getAllBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).sort({ createdAt: -1 });

    // Add spent amount to each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await calculateSpent(req.user._id, budget.category, budget.period);
        return {
          ...budget.toObject(),
          spent,
          remaining: Math.max(budget.amount - spent, 0),
          percentageUsed: budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0,
        };
      })
    );

    return success(res, 200, 'Budgets fetched', { budgets: budgetsWithSpent });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/budgets/:id
 */
const getBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) return error(res, 404, 'Budget not found');

    const spent = await calculateSpent(req.user._id, budget.category, budget.period);

    return success(res, 200, 'Budget fetched', {
      budget: {
        ...budget.toObject(),
        spent,
        remaining: Math.max(budget.amount - spent, 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/budgets
 * Create a new budget
 */
const createBudget = async (req, res, next) => {
  try {
    const { category, amount, period, incomeSource } = req.body;

    if (!category || !amount || !period) {
      return error(res, 400, 'Category, amount, and period are required');
    }

    if (amount <= 0) return error(res, 400, 'Amount must be greater than 0');

    // Check if budget already exists for this category
    const existing = await Budget.findOne({
      user: req.user._id,
      category: category.toLowerCase(),
    });

    if (existing) {
      return error(res, 409, `Budget for "${category}" already exists. Edit it instead.`);
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount,
      period,
      incomeSource: incomeSource || '',
    });

    return success(res, 201, 'Budget created successfully', { budget });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/budgets/:id
 */
const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) return error(res, 404, 'Budget not found');

    const fields = ['category', 'amount', 'period', 'incomeSource'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) budget[field] = req.body[field];
    });

    await budget.save();
    return success(res, 200, 'Budget updated successfully', { budget });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/budgets/:id
 * Hard delete (budgets aren't archived)
 */
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) return error(res, 404, 'Budget not found');
    return success(res, 200, 'Budget deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
};