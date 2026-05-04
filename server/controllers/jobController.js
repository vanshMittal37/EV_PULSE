const JobCard = require('../models/JobCard');

/**
 * @desc    Create a new job card
 * @route   POST /api/jobs
 * @access  Private (Service Vendor)
 */
exports.createJob = async (req, res, next) => {
  try {
    const job = await JobCard.create({
      ...req.body,
      vendorId: req.user._id
    });
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all jobs for a vendor or technician
 * @route   GET /api/jobs
 * @access  Private
 */
exports.getJobs = async (req, res, next) => {
  try {
    let query;
    if (req.user.role === 'SERVICE_VENDOR' || req.user.role === 'HYBRID_VENDOR') {
      query = { vendorId: req.user._id };
    } else if (req.user.role === 'TECHNICIAN') {
      query = { technicianId: req.user._id };
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const jobs = await JobCard.find(query).populate('technicianId', 'name email');
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update job status
 * @route   PUT /api/jobs/:id
 * @access  Private
 */
exports.updateJobStatus = async (req, res, next) => {
  try {
    const job = await JobCard.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Check if user is the technician assigned or the vendor
    if (job.technicianId.toString() !== req.user._id.toString() && job.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    job.status = req.body.status || job.status;
    job.priority = req.body.priority || job.priority;
    if (req.body.notes) job.notes.push(req.body.notes);
    
    await job.save();
    // Populate technician info before sending back
    const updatedJob = await JobCard.findById(job._id).populate('technicianId', 'name email');
    res.status(200).json({ success: true, data: updatedJob });

  } catch (error) {
    next(error);
  }
};
