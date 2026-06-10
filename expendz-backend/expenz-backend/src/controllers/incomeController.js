// src/controllers/incomeController.js
const Income = require('../models/Income');
const Archive = require('../models/Archive');
const { success, error } = require('../utils/apiResponse');

/**
 * GET /api/income
 * Get all income records for the logged-in user
 */
const getAllIncome = async (req, res, next) => {
  try {
    const incomes = await Income.find({ user: req.user._id }).sort({ date: -1 });
    return success(res, 200, 'Income records fetched', { incomes });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/income/sources
 * Get unique income sources (used by budget form)
 */
const getIncomeSources = async (req, res, next) => {
  try {
    const sources = await Income.distinct('source', { user: req.user._id });
    return success(res, 200, 'Income sources fetched', { sources });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/income/:id
 */
const getIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) return error(res, 404, 'Income record not found');
    return success(res, 200, 'Income fetched', { income });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/income
 * Create a new income record
 */
const createIncome = async (req, res, next) => {
  try {
    const { source, description, amount, category, date, recurrence } = req.body;

    if (!source || !amount || !category) {
      return error(res, 400, 'Source, amount, and category are required');
    }

    if (amount <= 0) return error(res, 400, 'Amount must be greater than 0');

    const income = await Income.create({
      user: req.user._id,
      source,
      description: description || '',
      amount,
      category,
      date: date || new Date(),
      recurrence: recurrence || 'one-time',
    });

    return success(res, 201, 'Income added successfully', { income });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/income/:id
 */
const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) return error(res, 404, 'Income record not found');

    const fields = ['source', 'description', 'amount', 'category', 'date', 'recurrence'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) income[field] = req.body[field];
    });

    await income.save();
    return success(res, 200, 'Income updated successfully', { income });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/income/:id
 * Soft delete - moves to archive
 */
const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!income) return error(res, 404, 'Income record not found');

    // Move to archive
    await Archive.create({
      user: req.user._id,
      originalModel: 'Income',
      source: income.source,
      description: income.description,
      amount: income.amount,
      category: income.category,
      type: income.type,
      date: income.date,
      recurrence: income.recurrence,
    });

    await income.deleteOne();
    return success(res, 200, 'Income moved to archive');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllIncome,
  getIncomeSources,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
};