// src/routes/incomeRoutes.js
const express = require('express');
const router = express.Router();

const {
  getAllIncome,
  getIncomeSources,
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
} = require('../controllers/incomeController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllIncome);
router.get('/sources', getIncomeSources);
router.post('/', createIncome);
router.get('/:id', getIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;