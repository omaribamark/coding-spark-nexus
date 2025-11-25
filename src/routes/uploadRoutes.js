const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authMiddleware } = require('../middleware/authMiddleware');
const db = require('../config/database');

const router = express.Router();

// Configure multer for memory storage (we'll store in database)
const storage = multer.memoryStorage();

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
    console.log('📋 Request body keys:', Object.keys(req.body));
    console.log('📋 Request content-type:', req.get('content-type'));
    
    const { image } = req.body;

    if (!image) {
      console.error('❌ No image data provided in request body');
      return res.status(400).json({
        success: false,
        error: 'No image data provided',
        code: 'VALIDATION_ERROR',
        details: 'Request body must include an "image" field'
      });
    }

    console.log('📝 Image data type:', typeof image);
    console.log('📝 Image data preview:', typeof image === 'string' ? image.substring(0, 100) : 'Not a string');

    // Check if it's a base64 image
    if (typeof image !== 'string' || !image.startsWith('data:image/')) {
      console.error('❌ Invalid image format. Expected base64 string starting with data:image/');
      return res.status(400).json({
        success: false,
        error: 'Invalid image format. Please provide a base64 encoded image.',
        code: 'VALIDATION_ERROR',
        details: 'Image must be a base64 string in format: data:image/[type];base64,[data]',
        received: typeof image === 'string' ? image.substring(0, 50) : typeof image
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

    const mimeType = `image/${matches[1]}`;
    const base64Data = matches[2];
    const fileExtension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const filename = `image-${uuidv4()}.${fileExtension}`;
    
    // Calculate file size (approximate from base64)
    const fileSize = Math.round((base64Data.length * 3) / 4);

    // Store image in database
    const result = await db.query(
      `INSERT INTO hakikisha.media_files 
       (filename, original_name, mime_type, file_size, file_data, uploaded_by, upload_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, filename`,
      [filename, filename, mimeType, fileSize, base64Data, req.user.userId, 'general']
    );

    const mediaId = result.rows[0].id;
    
    // Construct the URL to retrieve the image
    const imageUrl = `${req.protocol}://${req.get('host')}/api/v1/upload/images/${mediaId}`;

    console.log('✅ Image stored in database successfully:', filename);
    console.log('📁 Media ID:', mediaId);
    console.log('🔗 Image URL:', imageUrl);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: filename,
      mediaId: mediaId
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
router.post('/multipart', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Multipart image upload request received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
        code: 'VALIDATION_ERROR'
      });
    }

    const filename = `image-${uuidv4()}${path.extname(req.file.originalname)}`;
    const base64Data = req.file.buffer.toString('base64');
    const fileSize = req.file.size;

    // Store image in database
    const result = await db.query(
      `INSERT INTO hakikisha.media_files 
       (filename, original_name, mime_type, file_size, file_data, uploaded_by, upload_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, filename`,
      [filename, req.file.originalname, req.file.mimetype, fileSize, base64Data, req.user.userId, 'general']
    );

    const mediaId = result.rows[0].id;
    const imageUrl = `${req.protocol}://${req.get('host')}/api/v1/upload/images/${mediaId}`;

    console.log('✅ Multipart file stored in database:', filename);
    console.log('📁 Media ID:', mediaId);
    console.log('🔗 Image URL:', imageUrl);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: filename,
      mediaId: mediaId
    });

  } catch (error) {
    console.error('❌ Multipart upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
      code: 'UPLOAD_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get uploaded image by media ID
router.get('/images/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;

    // Retrieve image from database
    const result = await db.query(
      `SELECT filename, mime_type, file_data 
       FROM hakikisha.media_files 
       WHERE id = $1`,
      [mediaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Image not found',
        code: 'NOT_FOUND'
      });
    }

    const { mime_type, file_data } = result.rows[0];
    
    // Convert base64 back to buffer
    const imageBuffer = Buffer.from(file_data, 'base64');

    // Set proper headers
    res.set('Content-Type', mime_type);
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.send(imageBuffer);

  } catch (error) {
    console.error('❌ Get image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get image',
      code: 'SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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