// src/models/Budget.js
const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      lowercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'yearly'],
      default: 'monthly',
    },
    incomeSource: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

// Make sure user can't have duplicate category budgets
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);