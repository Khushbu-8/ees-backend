const express = require('express')
const router = express.Router()
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { addCategory, updateCategory, deleteCategory, getAllCategory } = require('../controllers/categoryController');
cloudinary.config({ 
    cloud_name: 'dosudib3y', 
    api_key: '159347713485299', 
    api_secret: 'TZ724I7MWn1BJ6eBt7nboJY-4h4' // Click 'View API Keys' above to copy your API secret
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'category', 
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [
        {
          crop: 'fill',
          gravity: 'center',
          quality: 'auto:best', // Automatically optimizes quality while maintaining visual fidelity
        }
      ]
  },
});
const upload = multer({ storage: storage });
router.post('/addCategory',upload.single('category'),addCategory)
router.post('/updateCategory',upload.single('category'),updateCategory)
router.delete('/deleteCategory',deleteCategory)
router.get('/getAllCategory',getAllCategory)
module.exports = router