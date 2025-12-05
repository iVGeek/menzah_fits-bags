const cloudinary = require('cloudinary').v2;

class CloudinaryConfig {
  constructor() {
    this.configured = false;
    this.error = null;
    
    try {
      this.validateEnv();
      this.configure();
      this.configured = true;
    } catch (err) {
      this.error = err.message;
      // Don't throw - allow server to start without Cloudinary
      console.warn('Cloudinary configuration warning:', err.message);
    }
  }

  validateEnv() {
    const required = [
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  configure() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true // Always use HTTPS for security
    });

    // Add response transformation defaults
    cloudinary.config({
      ...cloudinary.config(),
      responsive_breakpoints: {
        create_derived: true,
        bytes_step: 20000,
        min_width: 200,
        max_width: 1000,
        max_images: 20
      }
    });
  }

  isConfigured() {
    return this.configured;
  }

  getError() {
    return this.error;
  }

  getInstance() {
    if (!this.configured) {
      throw new Error(`Cloudinary is not configured: ${this.error}`);
    }
    return cloudinary;
  }
}

module.exports = new CloudinaryConfig();
