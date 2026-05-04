const express = require('express');
const router = express.Router();
const { getVendorDashboardStats, getVendorEarnings } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getVendorDashboardStats);
router.get('/earnings', getVendorEarnings);

module.exports = router;
