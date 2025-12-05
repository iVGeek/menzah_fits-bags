const cloudinaryConfig = require('../config/cloudinary');
const { createHash } = require('crypto');

class UploadService {
  constructor() {
    this.allowedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi'];
    this.maxFileSize = 100 * 1024 * 1024; // 100MB
  }

  getCloudinary() {
    if (!cloudinaryConfig.isConfigured()) {
      throw new Error('Cloudinary is not configured. Please set environment variables.');
    }
    return cloudinaryConfig.getInstance();
  }

  async uploadMedia(file, options = {}) {
    try {
      this.validateFile(file);
      
      const uploadOptions = {
        folder: options.folder || 'uploads',
        resource_type: this.getResourceType(file.mimetype),
        use_filename: true,
        unique_filename: false,
        overwrite: false,
        transformation: options.transformation || [],
        ...options
      };

      // Add eager transformations for images
      if (uploadOptions.resource_type === 'image') {
        uploadOptions.eager = [
          { width: 400, height: 300, crop: 'fill' },
          { width: 160, height: 120, crop: 'fill' }
        ];
        uploadOptions.eager_async = true;
      }

      // Generate public ID based on file content hash
      const publicId = this.generatePublicId(file);
      uploadOptions.public_id = `${uploadOptions.folder}/${publicId}`;

      const result = await this.executeUpload(file.path, uploadOptions);
      
      return this.formatResponse(result, uploadOptions.resource_type);
    } catch (error) {
      throw this.handleUploadError(error);
    }
  }

  validateFile(file) {
    if (!file || !file.path) {
      throw new Error('No file provided or invalid file object');
    }

    const extension = file.originalname.split('.').pop().toLowerCase();
    if (!this.allowedFormats.includes(extension)) {
      throw new Error(`Unsupported file format. Allowed: ${this.allowedFormats.join(', ')}`);
    }

    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
    }
  }

  getResourceType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'auto';
  }

  generatePublicId(file) {
    // Generate idempotent hash based on file content (name + size)
    // This ensures the same file gets the same public ID
    const hash = createHash('md5')
      .update(file.originalname + file.size)
      .digest('hex')
      .substring(0, 16);
    
    const nameWithoutExt = file.originalname.replace(/\.[^/.]+$/, "");
    const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    
    return `${safeName}-${hash}`;
  }

  async executeUpload(filePath, options) {
    const cloudinary = this.getCloudinary();
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filePath, options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }

  formatResponse(result, resourceType) {
    const baseResponse = {
      id: result.public_id,
      url: result.secure_url,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at,
      metadata: result.metadata || {}
    };

    if (resourceType === 'image') {
      const cloudinary = this.getCloudinary();
      return {
        ...baseResponse,
        width: result.width,
        height: result.height,
        thumbnail_url: cloudinary.url(result.public_id, {
          transformation: [{ width: 300, height: 300, crop: 'fill' }]
        })
      };
    }

    if (resourceType === 'video') {
      const cloudinary = this.getCloudinary();
      return {
        ...baseResponse,
        duration: result.duration,
        thumbnail_url: cloudinary.url(result.public_id, {
          resource_type: 'video',
          format: 'jpg'
        })
      };
    }

    return baseResponse;
  }

  handleUploadError(error) {
    console.error('Upload error:', error);

    if (error.http_code === 401) {
      return new Error('Invalid Cloudinary credentials. Check your API keys.');
    } else if (error.http_code === 400) {
      return new Error('Invalid file or upload parameters.');
    } else if (error.http_code === 413) {
      return new Error('File too large for upload.');
    } else if (error.http_code >= 500) {
      return new Error('Cloudinary service temporarily unavailable.');
    }

    return error.message.includes('ENOENT') 
      ? new Error('File not found or inaccessible.')
      : new Error(`Upload failed: ${error.message}`);
  }

  async deleteMedia(publicId, resourceType = 'image') {
    const cloudinary = this.getCloudinary();
    try {
      return await new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
          invalidate: true
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
    } catch (error) {
      throw new Error(`Failed to delete media: ${error.message}`);
    }
  }
}

module.exports = new UploadService();
