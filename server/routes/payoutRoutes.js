const express = require('express');
const router = express.Router();
const { getPayouts, requestWithdrawal } = require('../controllers/payoutController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getPayouts);
router.post('/withdraw', protect, requestWithdrawal);

module.exports = router;
