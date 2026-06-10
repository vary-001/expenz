// src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();

const { generateReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/generate', generateReport);

module.exports = router;