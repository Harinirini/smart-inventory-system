const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} = require('../controllers/assetController');
const { issueAsset, returnAsset } = require('../controllers/issueReturnController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getAssets)
  .post(authorize('admin', 'lab_staff'), createAsset);

router
  .route('/:id')
  .get(getAssetById)
  .put(authorize('admin', 'lab_staff'), updateAsset)
  .delete(authorize('admin'), deleteAsset);

router.post('/:id/issue', authorize('admin', 'lab_staff'), issueAsset);
router.post('/:id/return', authorize('admin', 'lab_staff'), returnAsset);

module.exports = router;
