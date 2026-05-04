const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isPdf = file.originalname.toLowerCase().endsWith('.pdf') || file.mimetype === 'application/pdf';
    
    if (isPdf) {
      // Clean filename and ensure it ends with .pdf
      const safeName = file.originalname.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
      return {
        folder: 'ev_pulse_documents',
        resource_type: 'raw',
        public_id: `${safeName}_${Date.now()}.pdf`
      };
    } else {
      return {
        folder: 'ev_pulse_documents',
        resource_type: 'auto'
      };
    }
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
