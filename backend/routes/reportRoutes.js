const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getAssetReport,
  getInventoryReport,
  getMaintenanceReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/dashboard', getDashboardMetrics);
router.get('/assets', getAssetReport);
router.get('/inventory', getInventoryReport);
router.get('/maintenance', getMaintenanceReport);

module.exports = router;
