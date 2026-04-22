const express = require('express');
const router = express.Router();
const { getVendors, updateVendorStatus } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes here require being a Super Admin
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.get('/vendors', getVendors);
router.put('/vendors/:id/status', updateVendorStatus);

module.exports = router;
