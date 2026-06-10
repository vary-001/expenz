// src/routes/archiveRoutes.js
const express = require('express');
const router = express.Router();

const {
  getAllArchives,
  restoreArchive,
  deleteArchive,
} = require('../controllers/archiveController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllArchives);
router.post('/:id/restore', restoreArchive);
router.delete('/:id', deleteArchive);

module.exports = router;