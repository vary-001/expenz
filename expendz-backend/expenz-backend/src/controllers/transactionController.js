// src/controllers/transactionController.js
const Transaction = require('../models/Transaction');
const { success, error } = require('../utils/apiResponse');

/**
 * GET /api/transactions
 * Get all transactions for the logged-in user
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    return success(res, 200, 'Transactions fetched', { transactions });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/transactions/:id
 * Get a single transaction
 */
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) return error(res, 404, 'Transaction not found');
    return success(res, 200, 'Transaction fetched', { transaction });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/transactions
 * Create a new expense transaction
 */
const createTransaction = async (req, res, next) => {
  try {
    const { description, amount, category, date, notes } = req.body;

    // Manual validation (simple)
    if (!description || !amount || !category) {
      return error(res, 400, 'Description, amount, and category are required');
    }

    if (amount <= 0) return error(res, 400, 'Amount must be greater than 0');

    const transaction = await Transaction.create({
      user: req.user._id,
      description,
      amount,
      category,
      date: date || new Date(),
      notes: notes || '',
    });

    return success(res, 201, 'Expense added successfully', { transaction });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/transactions/:id
 * Update an existing transaction
 */
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) return error(res, 404, 'Transaction not found');

    // Update only provided fields
    const fields = ['description', 'amount', 'category', 'date', 'notes'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) transaction[field] = req.body[field];
    });

    await transaction.save();
    return success(res, 200, 'Expense updated successfully', { transaction });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/transactions/:id
 * Hard delete (archive removed)
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) return error(res, 404, 'Transaction not found');
    await transaction.deleteOne();
    return success(res, 200, 'Transaction deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};