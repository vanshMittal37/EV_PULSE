const express = require('express');
const router = express.Router();
const { getPorts, addPort, updatePortStatus, getSessions, startSession, stopSession } = require('../controllers/chargingController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Ports
router.route('/ports')
  .get(getPorts)
  .post(addPort);

router.put('/ports/:id/status', updatePortStatus);

// Sessions
router.route('/sessions')
  .get(getSessions);

router.post('/sessions/start', startSession);
router.put('/sessions/:id/stop', stopSession);

module.exports = router;
