// src/models/Income.js
const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: [true, 'Income source is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      lowercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['income'],
      default: 'income',
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    recurrence: {
      type: String,
      enum: ['one-time', 'weekly', 'monthly', 'yearly'],
      default: 'one-time',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Income', incomeSchema);