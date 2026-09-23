const express = require('express');
const router = express.Router();
const {
  getMaintenanceRecords,
  createMaintenance,
  updateMaintenance,
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getMaintenanceRecords)
  .post(authorize('admin', 'lab_staff'), createMaintenance);

router
  .route('/:id')
  .put(authorize('admin', 'lab_staff'), updateMaintenance);

module.exports = router;
