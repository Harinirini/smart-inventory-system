const express = require('express');
const router = express.Router();
const { getStockTransactions } = require('../controllers/stockController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getStockTransactions);

module.exports = router;
