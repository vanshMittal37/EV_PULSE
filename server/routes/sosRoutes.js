const express = require('express');
const router = express.Router();
const { createSOS, getSOSAlerts, dispatchSOS, updateSOSStatus } = require('../controllers/sosController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createSOS);
router.get('/', getSOSAlerts);
router.put('/:id/dispatch', dispatchSOS);
router.put('/:id/status', updateSOSStatus);

module.exports = router;
