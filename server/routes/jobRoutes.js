const express = require('express');
const router = express.Router();
const { createJob, getJobs, updateJobStatus } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', createJob);
router.get('/', getJobs);
router.put('/:id', updateJobStatus);

module.exports = router;
