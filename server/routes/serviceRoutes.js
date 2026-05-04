const express = require('express');
const router = express.Router();
const { 
  getInvoices, createInvoice, updateInvoiceStatus, 
  getFeedbacks, createFeedback, replyToFeedback
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');

router.use(protect);

// Invoices
router.route('/invoices')


  .get(getInvoices)
  .post(createInvoice);

router.put('/invoices/:id/status', updateInvoiceStatus);

// Feedbacks
router.route('/feedback')
  .get(getFeedbacks)
  .post(createFeedback); // for demo/testing

router.put('/feedback/:id/reply', replyToFeedback);

module.exports = router;
