// src/controllers/archiveController.js
const Archive = require('../models/Archive');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const { success, error } = require('../utils/apiResponse');

const getAllArchives = async (req, res, next) => {
  try {
    const archives = await Archive.find({ user: req.user._id }).sort({ archivedAt: -1 });
    return success(res, 200, 'Archives fetched', {
      archives,
      count: archives.length,
    });
  } catch (err) {
    next(err);
  }
};

const restoreArchive = async (req, res, next) => {
  try {
    const archived = await Archive.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!archived) return error(res, 404, 'Archived item not found');

    let restored;

    if (archived.originalModel === 'Expense' || archived.originalModel === 'Transaction') {
      restored = await Expense.create({
        user: archived.user,
        description: archived.description,
        amount: archived.amount,
        category: archived.category,
        date: archived.date,
        notes: archived.notes || '',
      });
    } else if (archived.originalModel === 'Income') {
      restored = await Income.create({
        user: archived.user,
        source: archived.source,
        description: archived.description,
        amount: archived.amount,
        category: archived.category,
        date: archived.date,
        recurrence: archived.recurrence || 'one-time',
      });
    } else {
      return error(res, 400, 'Cannot restore unknown record type');
    }

    await archived.deleteOne();
    return success(res, 200, 'Item restored successfully', { restored });
  } catch (err) {
    next(err);
  }
};

const deleteArchive = async (req, res, next) => {
  try {
    const archived = await Archive.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!archived) return error(res, 404, 'Archived item not found');
    return success(res, 200, 'Item permanently deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllArchives, restoreArchive, deleteArchive };