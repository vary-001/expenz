// src/routes/transactionRoutes.js
const express = require('express');
const router = express.Router();

const {
  getAllTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');

const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.get('/', getAllTransactions);
router.post('/', createTransaction);
router.get('/:id', getTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;