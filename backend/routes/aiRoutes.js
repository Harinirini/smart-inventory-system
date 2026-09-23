const express = require('express');
const router = express.Router();
const { askAssistant } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/ask', askAssistant);

module.exports = router;
