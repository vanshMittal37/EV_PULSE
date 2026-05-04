const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getMe, 
  addTechnician, 
  getTechnicians, 
  uploadDocument, 
  registerWithDocuments, 
  updateStationStatus, 
  updateProfile,
  uploadStationImage,
  deleteStationImage,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', registerUser);
router.post('/register-with-documents', upload.single('document'), registerWithDocuments);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

// Document & Image routes
router.put('/upload-document', protect, upload.single('document'), uploadDocument);
router.put('/upload-station-image', protect, upload.single('image'), uploadStationImage);
router.delete('/station-image', protect, deleteStationImage);

// Profile routes
router.put('/update-profile', protect, updateProfile);
router.put('/update-station-status', protect, updateStationStatus);
router.put('/change-password', protect, changePassword);

// Technician routes
router.post('/technician', protect, addTechnician);
router.get('/technicians', protect, getTechnicians);

module.exports = router;
