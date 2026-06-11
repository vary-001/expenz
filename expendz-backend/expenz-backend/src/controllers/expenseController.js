// src/controllers/expenseController.js
const Expense = require('../models/Expense');
const { success, error } = require('../utils/apiResponse');

const getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1, createdAt: -1 });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    return success(res, 200, 'Expenses fetched', { expenses, total, count: expenses.length });
  } catch (err) {
    next(err);
  }
};

const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) return error(res, 404, 'Expense not found');
    return success(res, 200, 'Expense fetched', { expense });
  } catch (err) {
    next(err);
  }
};

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

const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id });
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
    return success(res, 200, 'Expense updated', { expense });
  } catch (err) {
    next(err);
  }
};

// HARD DELETE (no archive)
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return error(res, 404, 'Expense not found');
    return success(res, 200, 'Expense deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllExpenses, getExpense, createExpense, updateExpense, deleteExpense };