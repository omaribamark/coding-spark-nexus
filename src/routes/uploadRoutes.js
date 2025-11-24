const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/images/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = uuidv4();
    const fileExtension = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + fileExtension);
  }
});

const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Handle base64 image upload
router.post('/image', authMiddleware, async (req, res) => {
  try {
    console.log('📤 Upload image request received');
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        error: 'No image data provided',
        code: 'VALIDATION_ERROR'
      });
    }

    // Check if it's a base64 image
    if (!image.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Please provide a base64 encoded image.',
        code: 'VALIDATION_ERROR'
      });
    }

    // Extract mime type and base64 data
    const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({
        success: false,
        error: 'Invalid base64 image data',
        code: 'VALIDATION_ERROR'
      });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const fileExtension = mimeType === 'jpeg' ? 'jpg' : mimeType;
    const filename = `image-${uuidv4()}.${fileExtension}`;
    const filePath = path.join('uploads/images', filename);

    // Ensure upload directory exists
    const uploadDir = path.dirname(filePath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Write file
    fs.writeFileSync(filePath, base64Data, 'base64');

    // Construct the URL
    const imageUrl = `${req.protocol}://${req.get('host')}/${filePath}`;

    console.log('✅ File uploaded successfully:', filename);
    console.log('📁 File path:', filePath);
    console.log('🔗 Image URL:', imageUrl);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: filename,
      path: filePath
    });

  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      code: 'UPLOAD_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Handle multipart form data image upload
router.post('/multipart', authMiddleware, upload.single('image'), (req, res) => {
  try {
    console.log('📤 Multipart image upload request received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
        code: 'VALIDATION_ERROR'
      });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`;

    console.log('✅ Multipart file uploaded successfully:', req.file.filename);
    console.log('📁 File path:', req.file.path);
    console.log('🔗 Image URL:', imageUrl);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename,
      path: req.file.path
    });

  } catch (error) {
    console.error('❌ Multipart upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      code: 'UPLOAD_ERROR'
    });
  }
});

// Get uploaded image
router.get('/images/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads/images', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
        code: 'NOT_FOUND'
      });
    }

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('❌ Get image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get image',
      code: 'SERVER_ERROR'
    });
  }
});

// Health check for upload routes
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Upload routes are working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;