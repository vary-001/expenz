// src/models/Archive.js
const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // What model the record originally came from
    originalModel: {
      type: String,
      enum: ['Transaction', 'Income'],
      required: true,
    },
    // Snapshot of original data
    description: String,
    source: String,
    amount: Number,
    category: String,
    type: String,
    date: Date,
    notes: String,
    recurrence: String,
    archivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Archive', archiveSchema);