const express = require('express');
const multer = require('multer');
const uploadService = require('../services/uploadService');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Rate limiting for uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 uploads per windowMs
  message: 'Too many upload attempts, please try again later.'
});

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure multer for file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize filename: allow alphanumeric, dots, underscores, hyphens
    // Note: Multiple dots or leading dots are allowed here but handled by Cloudinary upload
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// Upload endpoint
router.post('/upload', uploadLimiter, upload.single('media'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Parse transformation with error handling
    let transformation = [];
    if (req.body.transformation) {
      try {
        transformation = JSON.parse(req.body.transformation);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid transformation JSON format'
        });
      }
    }

    const uploadOptions = {
      folder: req.body.folder || 'default',
      transformation
    };

    const result = await uploadService.uploadMedia(req.file, uploadOptions);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    // Clean up temp file
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete temp file:', err);
      });
    }
  }
});

// Delete endpoint
router.delete('/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const resourceType = req.query.type || 'image';

    await uploadService.deleteMedia(publicId, resourceType);

    res.status(200).json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
