const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryById,
  createInventoryItem,
  updateInventoryItem,
  stockChange,
  deleteInventoryItem,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getInventory)
  .post(authorize('admin', 'store_incharge'), createInventoryItem);

router
  .route('/:id')
  .get(getInventoryById)
  .put(authorize('admin', 'store_incharge'), updateInventoryItem)
  .delete(authorize('admin'), deleteInventoryItem);

router.post('/:id/stock-change', authorize('admin', 'store_incharge'), stockChange);

module.exports = router;
