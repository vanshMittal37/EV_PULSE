const express = require('express');
const router = express.Router();
const { getVendors, updateVendorStatus, getGlobalStats, deleteVendor, adminRegisterVendor } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes here require being a Super Admin
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.get('/stats', getGlobalStats);
router.get('/vendors', getVendors);
router.post('/vendors/register', adminRegisterVendor);
router.put('/vendors/:id/status', updateVendorStatus);
router.delete('/vendors/:id', deleteVendor);

module.exports = router;
