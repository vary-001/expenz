// src/routes/budgetRoutes.js
const express = require('express');
const router = express.Router();

const {
  getAllBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllBudgets);
router.post('/', createBudget);
router.get('/:id', getBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

module.exports = router;