// src/controllers/archiveController.js
const Transaction = require('../models/Transaction');
const Income = require('../models/Income');
const Archive = require('../models/Archive');
const { success, error } = require('../utils/apiResponse');

/**
 * GET /api/archives
 * Get all archived records for the logged-in user
 */
const getAllArchives = async (req, res, next) => {
  try {
    const archives = await Archive.find({ user: req.user._id }).sort({ archivedAt: -1 });
    return success(res, 200, 'Archives fetched', { archives });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/archives/:id/restore
 * Restore an archived record (Transaction or Income)
 */
const restoreArchive = async (req, res, next) => {
  try {
    const archive = await Archive.findOne({ _id: req.params.id, user: req.user._id });
    if (!archive) return error(res, 404, 'Archive not found');

    let restored;
    if (archive.originalModel === 'Transaction') {
      restored = await Transaction.create({
        user: req.user._id,
        description: archive.description,
        amount: archive.amount,
        category: archive.category,
        type: archive.type,
        date: archive.date,
        notes: archive.notes,
      });
    } else if (archive.originalModel === 'Income') {
      restored = await Income.create({
        user: req.user._id,
        source: archive.source,
        description: archive.description,
        amount: archive.amount,
        category: archive.category,
        date: archive.date,
        recurrence: archive.recurrence,
      });
    } else {
      return error(res, 400, 'Unknown archived model');
    }

    await archive.deleteOne();

    return success(res, 200, 'Archive restored successfully', { restored });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/archives/:id
 * Permanently delete an archive record
 */
const deleteArchive = async (req, res, next) => {
  try {
    const archive = await Archive.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!archive) return error(res, 404, 'Archive not found');
    return success(res, 200, 'Archive deleted successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllArchives, restoreArchive, deleteArchive };