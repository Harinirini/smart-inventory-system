const express = require('express');
const router = express.Router();
const { getIssueRecords } = require('../controllers/issueReturnController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getIssueRecords);

module.exports = router;
