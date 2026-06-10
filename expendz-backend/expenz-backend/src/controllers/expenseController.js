// src/controllers/expenseController.js
const Expense = require('../models/Expense');
const Archive = require('../models/Archive');
const { success, error } = require('../utils/apiResponse');

/**
 * GET /api/expenses
 * Get all expenses for the logged-in user (sorted newest first)
 */
const getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id })
      .sort({ date: -1, createdAt: -1 });

    // Also calculate totals for the user (useful for header stats)
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return success(res, 200, 'Expenses fetched', {
      expenses,
      total,
      count: expenses.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/expenses/:id
 */
const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense) return error(res, 404, 'Expense not found');
    return success(res, 200, 'Expense fetched', { expense });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/expenses
 * Create a new expense
 */
const createExpense = async (req, res, next) => {
  try {
    const { description, amount, category, date, notes } = req.body;

    if (!description || !amount || !category) {
      return error(res, 400, 'Description, amount, and category are required');
    }
    if (amount <= 0) return error(res, 400, 'Amount must be greater than 0');

    const expense = await Expense.create({
      user: req.user._id,
      description: description.trim(),
      amount: parseFloat(amount),
      category: category.toLowerCase().trim(),
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
    });

    return success(res, 201, 'Expense added successfully', { expense });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/expenses/:id
 */
const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense) return error(res, 404, 'Expense not found');

    const { description, amount, category, date, notes } = req.body;

    if (description !== undefined) expense.description = description.trim();
    if (amount !== undefined) {
      if (amount <= 0) return error(res, 400, 'Amount must be greater than 0');
      expense.amount = parseFloat(amount);
    }
    if (category !== undefined) expense.category = category.toLowerCase().trim();
    if (date !== undefined) expense.date = new Date(date);
    if (notes !== undefined) expense.notes = notes;

    await expense.save();
    return success(res, 200, 'Expense updated successfully', { expense });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/expenses/:id
 * Soft delete - moves to archive
 */
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!expense) return error(res, 404, 'Expense not found');

    await Archive.create({
      user: req.user._id,
      originalModel: 'Expense',
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      type: 'expense',
      date: expense.date,
      notes: expense.notes,
    });

    await expense.deleteOne();
    return success(res, 200, 'Expense moved to archive');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};