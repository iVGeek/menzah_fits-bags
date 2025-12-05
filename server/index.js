/**
 * Menzah_fits Backend Server
 * Stock Management API for Crochet Fashion Business
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;

// Import modular Cloudinary configuration
const modularCloudinary = require('./config/cloudinary');

// Import utilities
const { generateReceipt } = require('./utils/pdfGenerator');
const { sendReceiptEmail } = require('./utils/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================
// AUTHENTICATION CONFIGURATION
// ===========================

// Token secret for JWT-like signing (using HMAC-SHA256)
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex');

// Password hashing configuration
const HASH_CONFIG = {
    iterations: 100000, // PBKDF2 iterations
    keyLength: 64,      // Hash length in bytes
    digest: 'sha512'    // Hash algorithm
};

// Hash password using PBKDF2
function hashPassword(password, salt = null) {
    const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(
        password,
        passwordSalt,
        HASH_CONFIG.iterations,
        HASH_CONFIG.keyLength,
        HASH_CONFIG.digest
    ).toString('hex');
    
    return {
        hash,
        salt: passwordSalt
    };
}

// Verify password against hash
function verifyPassword(password, hash, salt) {
    const { hash: newHash } = hashPassword(password, salt);
    // Use timing-safe comparison to prevent timing attacks
    const hashBuffer = Buffer.from(hash, 'hex');
    const newHashBuffer = Buffer.from(newHash, 'hex');
    
    if (hashBuffer.length !== newHashBuffer.length) {
        return false;
    }
    
    return crypto.timingSafeEqual(hashBuffer, newHashBuffer);
}

// Generate JWT-like token (simplified, using HMAC)
function generateToken(payload) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };
    
    const data = {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(data)).toString('base64url');
    
    const signature = crypto
        .createHmac('sha256', TOKEN_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url');
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verify and decode token
function verifyToken(token) {
    try {
        const [encodedHeader, encodedPayload, signature] = token.split('.');
        
        if (!encodedHeader || !encodedPayload || !signature) {
            return null;
        }
        
        // Verify signature using timing-safe comparison
        const expectedSignature = crypto
            .createHmac('sha256', TOKEN_SECRET)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest('base64url');
        
        // Use timing-safe comparison to prevent timing attacks on signature
        const signatureBuffer = Buffer.from(signature, 'utf8');
        const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
        
        if (signatureBuffer.length !== expectedBuffer.length) {
            return null;
        }
        
        if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
            return null;
        }
        
        // Decode payload
        const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
        
        // Check expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        
        return payload;
    } catch (error) {
        return null;
    }
}

// Authentication middleware
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
        return res.status(401).json({ error: 'Unauthorized - Invalid or expired token' });
    }
    
    req.user = payload;
    next();
}

// Check if user is admin or dev_superior
function requireAdmin(req, res, next) {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'dev_superior')) {
        return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    next();
}

// Check if user is dev_superior
function requireDevSuperior(req, res, next) {
    if (!req.user || req.user.role !== 'dev_superior') {
        return res.status(403).json({ error: 'Forbidden - Dev Superior access required' });
    }
    next();
}

// ===========================
// MEDIA STORAGE CONFIGURATION
// ===========================

// Media upload configuration from environment variables
const MEDIA_CONFIG = {
    // File size limits (in bytes)
    maxImageSize: (parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 10) * 1024 * 1024,
    maxVideoSize: (parseInt(process.env.MAX_VIDEO_SIZE_MB, 10) || 50) * 1024 * 1024,
    
    // Allowed formats
    allowedImageFormats: (process.env.ALLOWED_IMAGE_FORMATS || 'jpg,jpeg,png,gif,webp').split(',').map(f => f.trim().toLowerCase()),
    allowedVideoFormats: (process.env.ALLOWED_VIDEO_FORMATS || 'mp4,webm,mov').split(',').map(f => f.trim().toLowerCase()),
    
    // Image optimization settings
    imageQuality: parseInt(process.env.IMAGE_QUALITY, 10) || 80,
    autoFormat: process.env.AUTO_FORMAT_CONVERSION !== 'false',
    responsiveImages: process.env.RESPONSIVE_IMAGES !== 'false',
    
    // Cloudinary folder structure
    folder: process.env.CLOUDINARY_FOLDER || 'menzah_fits/products',
    
    // Moderation settings (false, 'manual', 'webpurify', 'aws_rek')
    moderation: process.env.ENABLE_MODERATION && process.env.ENABLE_MODERATION !== 'false' ? process.env.ENABLE_MODERATION : false,
    
    // Responsive image sizes (widths in pixels)
    responsiveSizes: [320, 640, 960, 1280, 1920],
    
    // Image transformations for different use cases
    thumbnailSize: 300,
    previewSize: 800,
    fullSize: 1920
};

// Cloudinary configuration for media storage
// Configure using environment variables for security
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
    secure: true
});

// Check if Cloudinary is properly configured
function isCloudinaryConfigured() {
    return !!(process.env.CLOUDINARY_CLOUD_NAME && 
              process.env.CLOUDINARY_API_KEY && 
              process.env.CLOUDINARY_API_SECRET);
}

// Validate media file size
function validateFileSize(base64Data, maxSize, mediaType) {
    // Calculate approximate file size from base64 string
    // Base64 adds ~33% overhead, so actual size = (base64Length * 0.75)
    const base64Length = base64Data.replace(/^data:.*?;base64,/, '').length;
    const fileSizeBytes = (base64Length * 0.75);
    
    if (fileSizeBytes > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        const actualSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            error: `File size (${actualSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB for ${mediaType}`
        };
    }
    
    return { valid: true };
}

// Validate media format
function validateMediaFormat(base64Data, allowedFormats, mediaType) {
    // Extract format from base64 data URI
    const match = base64Data.match(/^data:.*?\/(.*?);base64,/);
    if (!match) {
        return {
            valid: false,
            error: 'Invalid media data format'
        };
    }
    
    const format = match[1].toLowerCase();
    
    if (!allowedFormats.includes(format)) {
        return {
            valid: false,
            error: `Format '${format}' is not allowed for ${mediaType}. Allowed formats: ${allowedFormats.join(', ')}`
        };
    }
    
    return { valid: true, format };
}

// Sanitize filename to prevent path traversal and other security issues
function sanitizeFilename(filename) {
    if (!filename) return '';
    
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars
        .replace(/\.{2,}/g, '_') // Remove double dots
        .replace(/^\.+/, '') // Remove leading dots
        .substring(0, 255); // Limit length
}

// Generate optimized image transformations
function getImageTransformations(options = {}) {
    const transformations = [];
    
    // Quality optimization
    if (MEDIA_CONFIG.imageQuality && !options.skipQuality) {
        transformations.push({
            quality: options.quality || MEDIA_CONFIG.imageQuality
        });
    }
    
    // Automatic format conversion (WebP/AVIF for modern browsers)
    if (MEDIA_CONFIG.autoFormat && !options.skipAutoFormat) {
        transformations.push({
            fetch_format: 'auto'
        });
    }
    
    // Responsive sizing
    if (options.width) {
        transformations.push({
            width: options.width,
            crop: options.crop || 'limit'
        });
    }
    
    if (options.height) {
        transformations.push({
            height: options.height,
            crop: options.crop || 'limit'
        });
    }
    
    // DPR (Device Pixel Ratio) support for retina displays
    if (options.dpr) {
        transformations.push({
            dpr: options.dpr
        });
    }
    
    return transformations;
}

// Generate responsive image URLs
function generateResponsiveUrls(publicId, baseUrl) {
    if (!MEDIA_CONFIG.responsiveImages) {
        return { original: baseUrl };
    }
    
    const urls = { original: baseUrl };
    
    // Generate URLs for different sizes
    MEDIA_CONFIG.responsiveSizes.forEach(width => {
        const transformation = `w_${width},c_limit,q_auto,f_auto`;
        urls[`w${width}`] = baseUrl.replace('/upload/', `/upload/${transformation}/`);
    });
    
    // Generate specific use-case URLs
    urls.thumbnail = baseUrl.replace('/upload/', `/upload/w_${MEDIA_CONFIG.thumbnailSize},c_fill,q_auto,f_auto/`);
    urls.preview = baseUrl.replace('/upload/', `/upload/w_${MEDIA_CONFIG.previewSize},c_limit,q_auto,f_auto/`);
    urls.full = baseUrl.replace('/upload/', `/upload/w_${MEDIA_CONFIG.fullSize},c_limit,q_auto,f_auto/`);
    
    return urls;
}

// Simple rate limiter for file serving routes
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

function rateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(ip)) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    const record = rateLimitStore.get(ip);
    
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + RATE_LIMIT_WINDOW;
        return next();
    }
    
    if (record.count >= MAX_REQUESTS) {
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    record.count++;
    next();
}

// Clean up rate limit store periodically
setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of rateLimitStore.entries()) {
        if (now > record.resetTime) {
            rateLimitStore.delete(ip);
        }
    }
}, RATE_LIMIT_WINDOW);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against whitelist
    // Support comma-separated ALLOWED_ORIGINS environment variable
    const envOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
          .map(o => o.trim())
          .filter(o => {
            // Validate that each origin is a valid URL with http:// or https://
            try {
              const url = new URL(o);
              return url.protocol === 'http:' || url.protocol === 'https:';
            } catch {
              return false;
            }
          })
      : [];
    
    const allowedOrigins = [
      'https://menzah-fits-bags.onrender.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      ...envOrigins
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 media uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===========================
// HEALTH CHECK (before static files to ensure it's not overridden)
// ===========================

// Health check endpoint to verify Cloudinary configuration
app.get('/health', (req, res) => {
  const configured = modularCloudinary.isConfigured();
  
  // Check if Cloudinary is configured
  if (!configured) {
    return res.json({
      status: 'healthy',
      cloudinary: 'not configured',
      environment: process.env.NODE_ENV || 'development',
      message: 'Server is running. Cloudinary media storage is optional.'
    });
  }
  
  // If configured, test the connection using the modular instance
  const cloudinaryInstance = modularCloudinary.getInstance();
  cloudinaryInstance.api.ping((error, result) => {
    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Cloudinary connection failed',
        error: error.message,
        environment: process.env.NODE_ENV || 'development'
      });
    }
    
    res.json({
      status: 'healthy',
      cloudinary: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  });
});

// Serve static files from the root directory (frontend)
app.use(express.static(path.join(__dirname, '..')));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// ===========================
// NEW MODULAR ROUTES
// ===========================

// Import the new upload routes (only if Cloudinary is configured)
let uploadRoutes;
if (modularCloudinary.isConfigured()) {
  uploadRoutes = require('./routes/uploadRoutes');
} else {
  console.warn('Cloudinary not configured - upload routes disabled');
  console.warn('To enable media uploads, set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
}

// Mount upload routes (requires authentication to be added in the routes)
// Only mount if Cloudinary is configured
if (modularCloudinary.isConfigured() && uploadRoutes) {
  app.use('/api/media', uploadRoutes);
}

// ===========================
// DATA PERSISTENCE
// ===========================

// Data directory for JSON storage
const DATA_DIR = path.join(__dirname, 'data');
const COLLECTIONS_FILE = path.join(DATA_DIR, 'collections.json');
const SALES_FILE = path.join(DATA_DIR, 'sales.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const STORY_GALLERY_FILE = path.join(DATA_DIR, 'story-gallery.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const RECEIPTS_DIR = path.join(DATA_DIR, 'receipts');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure receipts directory exists
if (!fs.existsSync(RECEIPTS_DIR)) {
    fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

// Load data from JSON file
function loadData(filepath, defaultData) {
    try {
        if (fs.existsSync(filepath)) {
            const data = fs.readFileSync(filepath, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error(`Error loading data from ${filepath}:`, error);
    }
    return defaultData;
}

// Save data to JSON file
function saveData(filepath, data) {
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (error) {
        console.error(`Error saving data to ${filepath}:`, error);
        return false;
    }
}

// Helper function to compute total stock from sizeStock
function computeTotalStock(colors) {
    return colors.reduce((sum, color) => {
        const sizeStock = color.sizeStock || {};
        return sum + Object.values(sizeStock).reduce((s, v) => s + (v || 0), 0);
    }, 0);
}

// Helper function to compute color's total stock from its sizeStock
function computeColorStock(sizeStock) {
    if (!sizeStock || typeof sizeStock !== 'object') return 0;
    return Object.values(sizeStock).reduce((sum, v) => sum + (v || 0), 0);
}

// Default collections data
const defaultCollections = [
    {
        id: '1',
        name: 'Ocean Breeze Maxi',
        category: 'dresses',
        price: 8500,
        priceFormatted: 'KES 8,500',
        colors: [
            { hex: '#2A7B9B', name: 'Ocean Blue', sizeStock: { 'S': 1, 'M': 2, 'L': 1, 'XL': 1 } },
            { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 1, 'M': 1, 'L': 1, 'XL': 0 } },
            { hex: '#E87461', name: 'Coral', sizeStock: { 'S': 0, 'M': 1, 'L': 1, 'XL': 0 } }
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Flowing maxi dress with intricate wave patterns',
        badge: 'bestseller',
        totalStock: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Coral Sunset Top',
        category: 'tops',
        price: 4200,
        priceFormatted: 'KES 4,200',
        colors: [
            { hex: '#E87461', name: 'Coral', sizeStock: { 'XS': 2, 'S': 2, 'M': 2, 'L': 2 } },
            { hex: '#F09B8D', name: 'Light Coral', sizeStock: { 'XS': 1, 'S': 1, 'M': 1, 'L': 1 } },
            { hex: '#C9BBA8', name: 'Taupe', sizeStock: { 'XS': 2, 'S': 1, 'M': 2, 'L': 1 } }
        ],
        sizes: ['XS', 'S', 'M', 'L'],
        description: 'Lightweight crochet top perfect for warm evenings',
        badge: null,
        totalStock: 18,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Sandy Shores Dress',
        category: 'dresses',
        price: 7800,
        priceFormatted: 'KES 7,800',
        colors: [
            { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 2, 'M': 1, 'L': 1 } },
            { hex: '#8B7355', name: 'Natural', sizeStock: { 'S': 1, 'M': 1, 'L': 1 } },
            { hex: '#FDF8F3', name: 'Cream', sizeStock: { 'S': 2, 'M': 2, 'L': 1 } }
        ],
        sizes: ['S', 'M', 'L'],
        description: 'Elegant beach dress with natural fiber texture',
        badge: 'new',
        totalStock: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '4',
        name: 'Coastal Elegance Set',
        category: 'sets',
        price: 12500,
        priceFormatted: 'KES 12,500',
        colors: [
            { hex: '#2A7B9B', name: 'Ocean', sizeStock: { 'S': 1, 'M': 0, 'L': 1, 'XL': 0 } },
            { hex: '#1E5A73', name: 'Deep Ocean', sizeStock: { 'S': 0, 'M': 1, 'L': 0, 'XL': 0 } },
            { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 1, 'M': 1, 'L': 1, 'XL': 0 } }
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        description: 'Two-piece ensemble for special occasions',
        badge: 'limited',
        totalStock: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '5',
        name: 'Tidal Wave Skirt',
        category: 'skirts',
        price: 5500,
        priceFormatted: 'KES 5,500',
        colors: [
            { hex: '#4FA3C7', name: 'Light Ocean', sizeStock: { 'XS': 1, 'S': 2, 'M': 2, 'L': 1, 'XL': 1 } },
            { hex: '#2A7B9B', name: 'Ocean', sizeStock: { 'XS': 1, 'S': 1, 'M': 1, 'L': 1, 'XL': 1 } },
            { hex: '#FDF8F3', name: 'Cream', sizeStock: { 'XS': 1, 'S': 1, 'M': 1, 'L': 1, 'XL': 0 } }
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        description: 'Flowing midi skirt with wave-inspired patterns',
        badge: null,
        totalStock: 16,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '6',
        name: 'Reef Romance Dress',
        category: 'dresses',
        price: 9200,
        priceFormatted: 'KES 9,200',
        colors: [
            { hex: '#E87461', name: 'Coral', sizeStock: { 'S': 1, 'M': 1, 'L': 1 } },
            { hex: '#D45341', name: 'Deep Coral', sizeStock: { 'S': 1, 'M': 1, 'L': 0 } },
            { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 1, 'M': 2, 'L': 1 } }
        ],
        sizes: ['S', 'M', 'L'],
        description: 'Romantic crochet dress with coral accents',
        badge: 'featured',
        totalStock: 9,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Load collections from file or use defaults
let collections = loadData(COLLECTIONS_FILE, defaultCollections);

// Default users data
function createDefaultUsers() {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';
    const devPassword = process.env.DEV_PASSWORD || 'dev@menzah2024';
    
    const adminHash = hashPassword(adminPassword);
    const devHash = hashPassword(devPassword);
    
    return [
        {
            id: uuidv4(),
            username: 'admin',
            name: 'Admin User',
            role: 'admin',
            passwordHash: adminHash.hash,
            passwordSalt: adminHash.salt,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: uuidv4(),
            username: 'devsuperior',
            name: 'Dev Superior',
            role: 'dev_superior',
            passwordHash: devHash.hash,
            passwordSalt: devHash.salt,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
}

// Load or create users
let users = loadData(USERS_FILE, createDefaultUsers());

// Save users if they were just created (to persist default users)
if (!fs.existsSync(USERS_FILE)) {
    saveData(USERS_FILE, users);
    console.log('✓ Default admin users created');
    console.log('  - Username: admin, Password:', process.env.ADMIN_PASSWORD || 'admin');
    console.log('  - Username: devsuperior, Password:', process.env.DEV_PASSWORD || 'dev@menzah2024');
}

// Default sales data structure
const defaultSales = [];

// Default analytics data structure
const defaultAnalytics = {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    revenueByCategory: {},
    salesByMonth: {},
    customerInsights: {
        totalCustomers: 0,
        returningCustomers: 0,
        newCustomers: 0
    },
    lastUpdated: new Date().toISOString()
};

// Load sales and analytics from files
let sales = loadData(SALES_FILE, defaultSales);
let analytics = loadData(ANALYTICS_FILE, defaultAnalytics);

// ===========================
// CURRENCY CONVERSION
// ===========================

// Supported currencies
const SUPPORTED_CURRENCIES = ['KES', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'ZAR'];
const BASE_CURRENCY = 'KES'; // Kenyan Shilling

// Cache for exchange rates (refresh every 1 hour)
let exchangeRatesCache = {
    rates: null,
    lastFetch: null,
    ttl: 3600000 // 1 hour in milliseconds
};

// Fetch current exchange rates from a free API
async function fetchExchangeRates() {
    const now = Date.now();
    
    // Return cached rates if still valid
    if (exchangeRatesCache.rates && exchangeRatesCache.lastFetch && 
        (now - exchangeRatesCache.lastFetch) < exchangeRatesCache.ttl) {
        return exchangeRatesCache.rates;
    }
    
    try {
        // Using exchangerate-api.com free tier (1500 requests/month)
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${BASE_CURRENCY}`);
        
        if (!response.ok) {
            throw new Error('Exchange rate API returned error');
        }
        
        const data = await response.json();
        
        exchangeRatesCache.rates = data.rates;
        exchangeRatesCache.lastFetch = now;
        
        return data.rates;
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        
        // Return fallback rates if API fails (Updated: December 2024)
        const fallbackRates = {
            KES: 1,
            USD: 0.0078,
            EUR: 0.0072,
            GBP: 0.0062,
            JPY: 1.16,
            CNY: 0.056,
            INR: 0.65,
            ZAR: 0.14
        };
        
        console.warn('Using fallback exchange rates (last updated: Dec 2024). These may be inaccurate!');
        return fallbackRates;
    }
}

// Convert amount from base currency to target currency
async function convertCurrency(amount, targetCurrency) {
    if (targetCurrency === BASE_CURRENCY) {
        return amount;
    }
    
    const rates = await fetchExchangeRates();
    const rate = rates[targetCurrency];
    
    if (!rate) {
        throw new Error(`Unsupported currency: ${targetCurrency}`);
    }
    
    return amount * rate;
}

// Format currency value
function formatCurrency(amount, currency) {
    const symbols = {
        KES: 'KES',
        USD: '$',
        EUR: '€',
        GBP: '£',
        JPY: '¥',
        CNY: '¥',
        INR: '₹',
        ZAR: 'R'
    };
    
    const decimals = currency === 'JPY' ? 0 : 2;
    const formatted = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return `${symbols[currency] || currency} ${formatted}`;
}

// Recalculate analytics from sales data
function recalculateAnalytics() {
    if (sales.length === 0) {
        analytics = { ...defaultAnalytics, lastUpdated: new Date().toISOString() };
        return;
    }
    
    // Calculate total revenue and orders
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = sales.length;
    const averageOrderValue = totalRevenue / totalOrders;
    
    // Calculate revenue by category
    const revenueByCategory = {};
    sales.forEach(sale => {
        sale.items.forEach(item => {
            const category = item.category || 'uncategorized';
            revenueByCategory[category] = (revenueByCategory[category] || 0) + item.subtotal;
        });
    });
    
    // Calculate top products
    const productSales = {};
    sales.forEach(sale => {
        sale.items.forEach(item => {
            if (!productSales[item.productId]) {
                productSales[item.productId] = {
                    productId: item.productId,
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].revenue += item.subtotal;
        });
    });
    
    const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    
    // Calculate sales by month
    const salesByMonth = {};
    sales.forEach(sale => {
        const month = sale.date.substring(0, 7); // YYYY-MM
        if (!salesByMonth[month]) {
            salesByMonth[month] = { revenue: 0, orders: 0 };
        }
        salesByMonth[month].revenue += sale.total;
        salesByMonth[month].orders += 1;
    });
    
    // Customer insights (simplified - based on unique customer IDs or emails)
    const uniqueCustomers = new Set(sales.map(s => s.customerId || s.customerEmail).filter(Boolean));
    const totalCustomers = uniqueCustomers.size;
    
    analytics = {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        topProducts,
        revenueByCategory,
        salesByMonth,
        customerInsights: {
            totalCustomers,
            returningCustomers: 0,
            newCustomers: totalCustomers
        },
        lastUpdated: new Date().toISOString()
    };
    
    saveData(ANALYTICS_FILE, analytics);
}

// Initialize analytics
recalculateAnalytics();

// ===========================
// PUBLIC API ROUTES
// ===========================

// Get all collections (public)
app.get('/api/collections', (req, res) => {
    const { category } = req.query;
    let result = collections;
    
    if (category && category !== 'all') {
        result = collections.filter(item => item.category === category);
    }
    
    // Return public data with color details including sizeStock and media
    const publicData = result.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.priceFormatted,
        colors: item.colors.map(c => ({ 
            hex: c.hex, 
            name: c.name, 
            sizeStock: c.sizeStock || {},
            stock: computeColorStock(c.sizeStock),
            media: c.media || []
        })),
        sizes: item.sizes || [],
        description: item.description,
        badge: item.badge,
        inStock: item.totalStock > 0
    }));
    
    res.json(publicData);
});

// Get single collection (public)
app.get('/api/collections/:id', (req, res) => {
    const item = collections.find(c => c.id === req.params.id);
    if (!item) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    res.json({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.priceFormatted,
        colors: item.colors.map(c => ({ 
            hex: c.hex, 
            name: c.name, 
            sizeStock: c.sizeStock || {},
            stock: computeColorStock(c.sizeStock),
            media: c.media || []
        })),
        sizes: item.sizes || [],
        description: item.description,
        badge: item.badge,
        inStock: item.totalStock > 0
    });
});

// ===========================
// AUTHENTICATION API ROUTES
// ===========================

// Login endpoint
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user by username
    const user = users.find(u => u.username === username);
    
    if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Verify password
    if (!verifyPassword(password, user.passwordHash, user.passwordSalt)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Generate token
    const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role
    });
    
    // Return user data (without password hash/salt) and token
    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
        }
    });
});

// Get current user info (protected)
app.get('/api/admin/me', authenticate, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
    });
});

// Change password (protected)
app.post('/api/admin/change-password', authenticate, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }
    
    // Find user
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    if (!verifyPassword(currentPassword, users[userIndex].passwordHash, users[userIndex].passwordSalt)) {
        return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const { hash, salt } = hashPassword(newPassword);
    
    // Update user password
    users[userIndex].passwordHash = hash;
    users[userIndex].passwordSalt = salt;
    users[userIndex].updatedAt = new Date().toISOString();
    
    saveData(USERS_FILE, users);
    
    res.json({ success: true, message: 'Password changed successfully' });
});

// Get all users (protected - admin only)
app.get('/api/admin/users', authenticate, requireAdmin, (req, res) => {
    const safeUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
    }));
    
    res.json(safeUsers);
});

// Create new user (protected - admin only)
app.post('/api/admin/users', authenticate, requireAdmin, (req, res) => {
    const { username, password, name, role } = req.body;
    
    if (!username || !password || !name || !role) {
        return res.status(400).json({ error: 'Username, password, name, and role are required' });
    }
    
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    
    if (!['admin', 'dev_superior'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role. Must be admin or dev_superior' });
    }
    
    if (role === 'dev_superior' && req.user.role !== 'dev_superior') {
        return res.status(403).json({ error: 'Only Dev Superior can create dev_superior users' });
    }
    
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }
    
    const { hash, salt } = hashPassword(password);
    
    const newUser = {
        id: uuidv4(),
        username,
        name,
        role,
        passwordHash: hash,
        passwordSalt: salt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveData(USERS_FILE, users);
    
    res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt
    });
});

// Update user (protected - admin only)
app.put('/api/admin/users/:id', authenticate, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { name, username, password, role } = req.body;
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (users[userIndex].role === 'dev_superior' && req.user.role !== 'dev_superior') {
        return res.status(403).json({ error: 'Only Dev Superior can modify dev_superior users' });
    }
    
    if (name) users[userIndex].name = name;
    
    if (username && username !== users[userIndex].username) {
        if (users.find(u => u.username === username && u.id !== id)) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        users[userIndex].username = username;
    }
    
    if (role) {
        if (!['admin', 'dev_superior'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        if (role === 'dev_superior' && req.user.role !== 'dev_superior') {
            return res.status(403).json({ error: 'Only Dev Superior can assign dev_superior role' });
        }
        users[userIndex].role = role;
    }
    
    if (password) {
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        const { hash, salt } = hashPassword(password);
        users[userIndex].passwordHash = hash;
        users[userIndex].passwordSalt = salt;
    }
    
    users[userIndex].updatedAt = new Date().toISOString();
    
    saveData(USERS_FILE, users);
    
    res.json({
        id: users[userIndex].id,
        username: users[userIndex].username,
        name: users[userIndex].name,
        role: users[userIndex].role,
        updatedAt: users[userIndex].updatedAt
    });
});

// Delete user (protected - admin only)
app.delete('/api/admin/users/:id', authenticate, requireAdmin, (req, res) => {
    const { id } = req.params;
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (users[userIndex].id === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    if (users[userIndex].role === 'dev_superior') {
        return res.status(403).json({ error: 'Cannot delete dev_superior users' });
    }
    
    if (users[userIndex].role === 'admin' && req.user.role !== 'dev_superior') {
        return res.status(403).json({ error: 'Only Dev Superior can delete admin users' });
    }
    
    users.splice(userIndex, 1);
    saveData(USERS_FILE, users);
    
    res.json({ success: true, message: 'User deleted successfully' });
});

// ===========================
// ADMIN API ROUTES (Authentication required)
// ===========================

// Get all collections with stock info
app.get('/api/admin/collections', authenticate, (req, res) => {
    res.json(collections);
});

// Get single collection with stock
app.get('/api/admin/collections/:id', authenticate, (req, res) => {
    const item = collections.find(c => c.id === req.params.id);
    if (!item) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(item);
});

// Create new collection (admin only)
app.post('/api/admin/collections', authenticate, requireAdmin, (req, res) => {
    const { name, category, price, colors, sizes, description, badge } = req.body;
    
    if (!name || !category || !price || !colors || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const processedColors = colors.map(c => ({
        hex: c.hex,
        name: c.name,
        sizeStock: c.sizeStock || {},
        media: c.media || []
    }));
    
    const totalStock = computeTotalStock(processedColors);
    
    const newItem = {
        id: uuidv4(),
        name,
        category,
        price: Number(price),
        priceFormatted: `KES ${Number(price).toLocaleString()}`,
        colors: processedColors,
        sizes: sizes || [],
        description,
        badge: badge || null,
        totalStock,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    collections.push(newItem);
    saveData(COLLECTIONS_FILE, collections);
    res.status(201).json(newItem);
});

// Update collection (admin only)
app.put('/api/admin/collections/:id', authenticate, requireAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const { name, category, price, colors, sizes, description, badge } = req.body;
    const existing = collections[index];
    
    let updatedColors;
    if (colors) {
        updatedColors = colors.map(c => ({
            hex: c.hex,
            name: c.name,
            sizeStock: c.sizeStock || {},
            media: c.media || []
        }));
    } else {
        updatedColors = existing.colors;
    }
    
    const totalStock = computeTotalStock(updatedColors);
    
    collections[index] = {
        ...existing,
        name: name || existing.name,
        category: category || existing.category,
        price: price ? Number(price) : existing.price,
        priceFormatted: price ? `KES ${Number(price).toLocaleString()}` : existing.priceFormatted,
        colors: updatedColors,
        sizes: sizes || existing.sizes,
        description: description || existing.description,
        badge: badge !== undefined ? badge : existing.badge,
        totalStock,
        updatedAt: new Date().toISOString()
    };
    
    saveData(COLLECTIONS_FILE, collections);
    res.json(collections[index]);
});

// Update stock for specific color and size (admin only)
app.patch('/api/admin/collections/:id/stock', authenticate, requireAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const { colorHex, sizeStock } = req.body;
    
    if (!colorHex || !sizeStock || typeof sizeStock !== 'object') {
        return res.status(400).json({ error: 'colorHex and sizeStock (object) are required' });
    }
    
    const colorIndex = collections[index].colors.findIndex(c => c.hex === colorHex);
    if (colorIndex === -1) {
        return res.status(404).json({ error: 'Color not found' });
    }
    
    collections[index].colors[colorIndex].sizeStock = sizeStock;
    collections[index].totalStock = computeTotalStock(collections[index].colors);
    collections[index].updatedAt = new Date().toISOString();
    
    saveData(COLLECTIONS_FILE, collections);
    res.json(collections[index]);
});

// Add new color to collection (admin only)
app.post('/api/admin/collections/:id/colors', authenticate, requireAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const { hex, name, sizeStock } = req.body;
    
    if (!hex || !name) {
        return res.status(400).json({ error: 'hex and name are required' });
    }
    
    if (collections[index].colors.some(c => c.hex === hex)) {
        return res.status(400).json({ error: 'Color already exists' });
    }
    
    collections[index].colors.push({ hex, name, sizeStock: sizeStock || {} });
    collections[index].totalStock = computeTotalStock(collections[index].colors);
    collections[index].updatedAt = new Date().toISOString();
    
    saveData(COLLECTIONS_FILE, collections);
    res.json(collections[index]);
});

// Remove color from collection (admin only)
app.delete('/api/admin/collections/:id/colors/:colorHex', authenticate, requireAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const colorHex = decodeURIComponent(req.params.colorHex);
    collections[index].colors = collections[index].colors.filter(c => c.hex !== colorHex);
    collections[index].totalStock = computeTotalStock(collections[index].colors);
    collections[index].updatedAt = new Date().toISOString();
    
    saveData(COLLECTIONS_FILE, collections);
    res.json(collections[index]);
});

// Delete collection (admin only)
app.delete('/api/admin/collections/:id', authenticate, requireAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    collections.splice(index, 1);
    saveData(COLLECTIONS_FILE, collections);
    res.json({ success: true, message: 'Collection deleted' });
});

// Get inventory summary (admin only)
app.get('/api/admin/inventory', authenticate, (req, res) => {
    const summary = {
        totalProducts: collections.length,
        totalStock: collections.reduce((sum, c) => sum + c.totalStock, 0),
        lowStock: collections.filter(c => c.totalStock > 0 && c.totalStock < 5),
        outOfStock: collections.filter(c => c.totalStock === 0),
        byCategory: collections.reduce((acc, c) => {
            acc[c.category] = (acc[c.category] || 0) + 1;
            return acc;
        }, {})
    };
    res.json(summary);
});

// ===========================
// ANALYTICS & SALES API ROUTES
// ===========================

// Get analytics dashboard data
app.get('/api/admin/analytics', authenticate, async (req, res) => {
    const { currency = BASE_CURRENCY } = req.query;
    
    try {
        let convertedAnalytics = { ...analytics };
        
        if (currency !== BASE_CURRENCY) {
            const rates = await fetchExchangeRates();
            const rate = rates[currency];
            
            if (rate) {
                convertedAnalytics.totalRevenue = analytics.totalRevenue * rate;
                convertedAnalytics.averageOrderValue = analytics.averageOrderValue * rate;
                
                convertedAnalytics.topProducts = analytics.topProducts.map(p => ({
                    ...p,
                    revenue: p.revenue * rate
                }));
                
                convertedAnalytics.revenueByCategory = {};
                Object.keys(analytics.revenueByCategory).forEach(category => {
                    convertedAnalytics.revenueByCategory[category] = analytics.revenueByCategory[category] * rate;
                });
                
                convertedAnalytics.salesByMonth = {};
                Object.keys(analytics.salesByMonth).forEach(month => {
                    convertedAnalytics.salesByMonth[month] = {
                        revenue: analytics.salesByMonth[month].revenue * rate,
                        orders: analytics.salesByMonth[month].orders
                    };
                });
            }
        }
        
        convertedAnalytics.currency = currency;
        res.json(convertedAnalytics);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Get sales data
app.get('/api/admin/sales', authenticate, (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;
    
    let filteredSales = [...sales];
    
    if (startDate) {
        filteredSales = filteredSales.filter(s => s.date >= startDate);
    }
    if (endDate) {
        filteredSales = filteredSales.filter(s => s.date <= endDate);
    }
    
    filteredSales.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredSales = filteredSales.slice(0, parseInt(limit, 10));
    
    res.json(filteredSales);
});

// Create new sale
app.post('/api/admin/sales', authenticate, requireAdmin, (req, res) => {
    const { items, customerId, customerEmail, customerName, total, currency = BASE_CURRENCY } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items array is required' });
    }
    
    if (typeof total !== 'number' || total <= 0) {
        return res.status(400).json({ error: 'Valid total amount is required' });
    }
    
    const newSale = {
        id: uuidv4(),
        date: new Date().toISOString(),
        items,
        customerId,
        customerEmail,
        customerName,
        total,
        currency,
        status: 'completed',
        createdAt: new Date().toISOString()
    };
    
    sales.push(newSale);
    saveData(SALES_FILE, sales);
    recalculateAnalytics();
    
    res.status(201).json(newSale);
});

// Update sale
app.put('/api/admin/sales/:id', authenticate, requireAdmin, (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const index = sales.findIndex(s => s.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Sale not found' });
    }
    
    sales[index] = {
        ...sales[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    saveData(SALES_FILE, sales);
    recalculateAnalytics();
    
    res.json(sales[index]);
});

// Delete sale
app.delete('/api/admin/sales/:id', authenticate, requireAdmin, (req, res) => {
    const { id } = req.params;
    
    const index = sales.findIndex(s => s.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Sale not found' });
    }
    
    sales.splice(index, 1);
    saveData(SALES_FILE, sales);
    recalculateAnalytics();
    
    res.json({ success: true, message: 'Sale deleted' });
});

// Generate and send receipt for an order
app.post('/api/admin/sales/:id/receipt', authenticate, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { sendEmail } = req.body;
    
    try {
        const order = sales.find(s => s.id === id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        const receiptFilename = `receipt-${id}-${Date.now()}.pdf`;
        const receiptPath = path.join(RECEIPTS_DIR, receiptFilename);
        
        await generateReceipt(order, receiptPath);
        console.log(`✅ Receipt generated: ${receiptFilename}`);
        
        let emailSent = false;
        let emailError = null;
        
        if (sendEmail && order.customerEmail) {
            try {
                await sendReceiptEmail({
                    to: order.customerEmail,
                    customerName: order.customerName,
                    orderId: id,
                    pdfPath: receiptPath,
                    total: order.total || 0
                });
                emailSent = true;
                console.log(`✅ Receipt emailed to ${order.customerEmail}`);
            } catch (error) {
                console.error('Email send failed:', error);
                emailError = error.message;
            }
        }
        
        res.json({
            success: true,
            receiptPath: `/api/admin/receipts/${receiptFilename}`,
            emailSent,
            emailError,
            message: emailSent 
                ? 'Receipt generated and sent via email'
                : 'Receipt generated successfully'
        });
        
    } catch (error) {
        console.error('Receipt generation failed:', error);
        res.status(500).json({ 
            error: 'Failed to generate receipt',
            details: error.message
        });
    }
});

// Download receipt PDF
app.get('/api/admin/receipts/:filename', authenticate, (req, res) => {
    const { filename } = req.params;
    
    const safeFilename = path.basename(filename);
    const filePath = path.join(RECEIPTS_DIR, safeFilename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Receipt not found' });
    }
    
    res.download(filePath, safeFilename, (err) => {
        if (err) {
            console.error('Download error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to download receipt' });
            }
        }
    });
});

// Get exchange rates
app.get('/api/admin/exchange-rates', authenticate, async (req, res) => {
    try {
        const rates = await fetchExchangeRates();
        res.json({
            base: BASE_CURRENCY,
            rates,
            supportedCurrencies: SUPPORTED_CURRENCIES,
            lastUpdated: new Date(exchangeRatesCache.lastFetch).toISOString()
        });
    } catch (error) {
        console.error('Exchange rates error:', error);
        res.status(500).json({ error: 'Failed to fetch exchange rates' });
    }
});

// Convert currency value
app.post('/api/admin/convert-currency', authenticate, async (req, res) => {
    const { amount, from = BASE_CURRENCY, to } = req.body;
    
    if (typeof amount !== 'number') {
        return res.status(400).json({ error: 'Amount must be a number' });
    }
    
    if (!to) {
        return res.status(400).json({ error: 'Target currency is required' });
    }
    
    try {
        const rates = await fetchExchangeRates();
        
        let result = amount;
        let exchangeRate = 1;
        
        if (from === BASE_CURRENCY && to === BASE_CURRENCY) {
            result = amount;
            exchangeRate = 1;
        } else if (from === BASE_CURRENCY) {
            result = amount * rates[to];
            exchangeRate = rates[to];
        } else if (to === BASE_CURRENCY) {
            result = amount / rates[from];
            exchangeRate = 1 / rates[from];
        } else {
            const amountInBase = amount / rates[from];
            result = amountInBase * rates[to];
            exchangeRate = rates[to] / rates[from];
        }
        
        res.json({
            amount,
            from,
            to,
            result,
            formatted: formatCurrency(result, to),
            rate: exchangeRate
        });
    } catch (error) {
        console.error('Currency conversion error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ===========================
// MEDIA UPLOAD API ROUTES
// ===========================

// Upload media to Cloudinary (admin only)
app.post('/api/admin/media/upload', authenticate, requireAdmin, async (req, res) => {
    if (!isCloudinaryConfigured()) {
        return res.status(503).json({ 
            error: 'Media storage not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.',
            configured: false,
            docs: 'See README.md for Cloudinary setup instructions'
        });
    }
    
    const { data, type, folder, productId, colorIndex, filename } = req.body;
    
    if (!data) {
        return res.status(400).json({ error: 'No media data provided' });
    }
    
    const allowedTypes = ['image', 'video'];
    const mediaType = type || 'image';
    if (!allowedTypes.includes(mediaType)) {
        return res.status(400).json({ error: 'Invalid media type. Allowed: image, video' });
    }
    
    try {
        const maxSize = mediaType === 'video' ? MEDIA_CONFIG.maxVideoSize : MEDIA_CONFIG.maxImageSize;
        const sizeValidation = validateFileSize(data, maxSize, mediaType);
        if (!sizeValidation.valid) {
            return res.status(400).json({ error: sizeValidation.error });
        }
        
        const allowedFormats = mediaType === 'video' ? MEDIA_CONFIG.allowedVideoFormats : MEDIA_CONFIG.allowedImageFormats;
        const formatValidation = validateMediaFormat(data, allowedFormats, mediaType);
        if (!formatValidation.valid) {
            return res.status(400).json({ error: formatValidation.error });
        }
        
        const uploadFolder = folder || MEDIA_CONFIG.folder;
        const uploadOptions = {
            folder: uploadFolder,
            resource_type: mediaType === 'video' ? 'video' : 'image',
            public_id: filename ? sanitizeFilename(filename) : undefined,
            unique_filename: !filename,
            overwrite: false,
            invalidate: true
        };
        
        if (mediaType === 'image') {
            uploadOptions.transformation = getImageTransformations({
                quality: MEDIA_CONFIG.imageQuality
            });
            
            if (MEDIA_CONFIG.responsiveImages) {
                uploadOptions.eager = [
                    { width: MEDIA_CONFIG.thumbnailSize, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
                    { width: MEDIA_CONFIG.previewSize, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
                    { width: MEDIA_CONFIG.fullSize, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
                ];
                uploadOptions.eager_async = true;
            }
            
            if (MEDIA_CONFIG.moderation && MEDIA_CONFIG.moderation !== 'false') {
                uploadOptions.moderation = MEDIA_CONFIG.moderation;
            }
        }
        
        if (mediaType === 'video') {
            uploadOptions.transformation = [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ];
            uploadOptions.eager = [
                { format: 'jpg', transformation: [{ quality: 'auto' }] }
            ];
            uploadOptions.eager_async = true;
        }
        
        const result = await cloudinary.uploader.upload(data, uploadOptions);
        
        let responsiveUrls = null;
        if (mediaType === 'image' && MEDIA_CONFIG.responsiveImages) {
            responsiveUrls = generateResponsiveUrls(result.public_id, result.secure_url);
        }
        
        const mediaResponse = {
            id: result.public_id,
            url: result.secure_url,
            type: mediaType,
            format: result.format,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            size: `${(result.bytes / 1024).toFixed(1)} KB`,
            createdAt: result.created_at,
            folder: uploadFolder
        };
        
        if (responsiveUrls) {
            mediaResponse.responsive = responsiveUrls;
        }
        
        if (result.eager && result.eager.length > 0) {
            mediaResponse.eager = result.eager.map(e => ({
                url: e.secure_url,
                width: e.width,
                height: e.height,
                format: e.format
            }));
        }
        
        if (result.moderation && result.moderation.length > 0) {
            mediaResponse.moderation = result.moderation;
        }
        
        res.status(201).json({
            success: true,
            media: mediaResponse,
            productId,
            colorIndex,
            message: `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} uploaded successfully`
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        
        let errorMessage = 'Failed to upload media';
        let errorDetails = error.message;
        
        if (error.http_code === 401) {
            errorMessage = 'Cloudinary authentication failed. Please check your API credentials.';
        } else if (error.http_code === 400) {
            errorMessage = 'Invalid upload request. Please check the media data format.';
        } else if (error.http_code === 420) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
        }
        
        res.status(error.http_code || 500).json({ 
            success: false,
            error: errorMessage,
            details: errorDetails 
        });
    }
});

// Delete media from Cloudinary (admin only)
app.delete('/api/admin/media/:publicId', authenticate, requireAdmin, async (req, res) => {
    if (!isCloudinaryConfigured()) {
        return res.status(503).json({ 
            error: 'Media storage not configured',
            configured: false
        });
    }
    
    const { publicId } = req.params;
    const { resourceType } = req.query;
    
    if (!publicId) {
        return res.status(400).json({ error: 'Media ID is required' });
    }
    
    try {
        const fullPublicId = decodeURIComponent(publicId);
        const result = await cloudinary.uploader.destroy(fullPublicId, {
            resource_type: resourceType || 'image'
        });
        
        if (result.result === 'ok' || result.result === 'not found') {
            res.json({ success: true, message: 'Media deleted successfully' });
        } else {
            res.status(400).json({ error: 'Failed to delete media', result });
        }
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to delete media',
            details: error.message 
        });
    }
});

// Check Cloudinary configuration status (admin only)
app.get('/api/admin/media/status', authenticate, (req, res) => {
    const configured = isCloudinaryConfigured();
    
    res.json({
        configured,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 
            process.env.CLOUDINARY_CLOUD_NAME.substring(0, 3) + '***' : null,
        config: {
            maxImageSizeMB: MEDIA_CONFIG.maxImageSize / (1024 * 1024),
            maxVideoSizeMB: MEDIA_CONFIG.maxVideoSize / (1024 * 1024),
            allowedImageFormats: MEDIA_CONFIG.allowedImageFormats,
            allowedVideoFormats: MEDIA_CONFIG.allowedVideoFormats,
            imageQuality: MEDIA_CONFIG.imageQuality,
            autoFormatConversion: MEDIA_CONFIG.autoFormat,
            responsiveImages: MEDIA_CONFIG.responsiveImages,
            responsiveSizes: MEDIA_CONFIG.responsiveSizes,
            folder: MEDIA_CONFIG.folder,
            moderation: !!MEDIA_CONFIG.moderation,
            features: {
                thumbnails: true,
                preview: true,
                fullSize: true,
                webpConversion: MEDIA_CONFIG.autoFormat,
                lazyLoading: MEDIA_CONFIG.responsiveImages,
                cdnDelivery: configured
            }
        },
        setupInstructions: configured ? null : {
            message: 'Cloudinary is not configured. Follow these steps:',
            steps: [
                '1. Sign up at https://cloudinary.com/',
                '2. Get your Cloud Name, API Key, and API Secret from the dashboard',
                '3. Set environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET',
                '4. Restart the server',
                '5. See README.md for detailed instructions'
            ]
        }
    });
});

// Add media to a product color (admin only)
app.post('/api/admin/collections/:id/colors/:colorIndex/media', authenticate, requireAdmin, async (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const colorIndex = parseInt(req.params.colorIndex, 10);
    if (isNaN(colorIndex) || colorIndex < 0 || colorIndex >= collections[index].colors.length) {
        return res.status(400).json({ error: 'Invalid color index' });
    }
    
    const { media } = req.body;
    if (!media || !media.url || !media.type) {
        return res.status(400).json({ error: 'Media object with url and type is required' });
    }
    
    if (!collections[index].colors[colorIndex].media) {
        collections[index].colors[colorIndex].media = [];
    }
    
    const newMedia = {
        id: media.id || uuidv4(),
        url: media.url,
        type: media.type,
        createdAt: new Date().toISOString()
    };
    
    collections[index].colors[colorIndex].media.push(newMedia);
    collections[index].updatedAt = new Date().toISOString();
    
    saveData(COLLECTIONS_FILE, collections);
    res.status(201).json({
        success: true,
        collection: collections[index],
        addedMedia: newMedia
    });
});

// Remove media from a product color (admin only)
app.delete('/api/admin/collections/:id/colors/:colorIndex/media/:mediaId', authenticate, requireAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const colorIndex = parseInt(req.params.colorIndex, 10);
    if (isNaN(colorIndex) || colorIndex < 0 || colorIndex >= collections[index].colors.length) {
        return res.status(400).json({ error: 'Invalid color index' });
    }
    
    const color = collections[index].colors[colorIndex];
    if (!color.media || color.media.length === 0) {
        return res.status(404).json({ error: 'No media found for this color' });
    }
    
    const mediaId = decodeURIComponent(req.params.mediaId);
    const mediaIndex = color.media.findIndex(m => m.id === mediaId);
    if (mediaIndex === -1) {
        return res.status(404).json({ error: 'Media not found' });
    }
    
    const removedMedia = color.media.splice(mediaIndex, 1)[0];
    collections[index].updatedAt = new Date().toISOString();
    
    saveData(COLLECTIONS_FILE, collections);
    res.json({
        success: true,
        collection: collections[index],
        removedMedia
    });
});

// ===========================
// OUR STORY GALLERY API ROUTES
// ===========================

// Story gallery constants
const STORY_GALLERY_CATEGORIES = ['designs', 'artisan', 'clients', 'summer', 'custom', 'team'];
const DEFAULT_STORY_GALLERY = {
    designs: [],
    artisan: [],
    clients: [],
    summer: [],
    custom: [],
    team: []
};

// Get Our Story gallery (public endpoint)
app.get('/api/story-gallery', (req, res) => {
    const gallery = loadData(STORY_GALLERY_FILE, DEFAULT_STORY_GALLERY);
    res.json(gallery);
});

// Update Our Story gallery (admin only)
app.post('/api/admin/story-gallery', authenticate, requireAdmin, (req, res) => {
    const { category, photos } = req.body;
    
    if (!category || !STORY_GALLERY_CATEGORIES.includes(category)) {
        return res.status(400).json({ 
            error: 'Invalid category. Must be one of: ' + STORY_GALLERY_CATEGORIES.join(', ')
        });
    }
    
    if (!Array.isArray(photos)) {
        return res.status(400).json({ error: 'Photos must be an array' });
    }
    
    const gallery = loadData(STORY_GALLERY_FILE, DEFAULT_STORY_GALLERY);
    gallery[category] = photos;
    
    if (!saveData(STORY_GALLERY_FILE, gallery)) {
        return res.status(500).json({ error: 'Failed to save story gallery' });
    }
    
    res.json({ 
        success: true, 
        gallery,
        message: `Updated ${category} gallery with ${photos.length} photos`
    });
});

// Add photo to a category (admin only)
app.post('/api/admin/story-gallery/:category/photos', authenticate, requireAdmin, (req, res) => {
    const { category } = req.params;
    const { photo } = req.body;
    
    if (!STORY_GALLERY_CATEGORIES.includes(category)) {
        return res.status(400).json({ 
            error: 'Invalid category. Must be one of: ' + STORY_GALLERY_CATEGORIES.join(', ')
        });
    }
    
    if (!photo || typeof photo !== 'object') {
        return res.status(400).json({ error: 'Photo object is required' });
    }
    
    if (!photo.id || !photo.url) {
        return res.status(400).json({ error: 'Photo must have id and url' });
    }
    
    const gallery = loadData(STORY_GALLERY_FILE, DEFAULT_STORY_GALLERY);
    
    if (!gallery[category]) {
        gallery[category] = [];
    }
    gallery[category].push(photo);
    
    if (!saveData(STORY_GALLERY_FILE, gallery)) {
        return res.status(500).json({ error: 'Failed to save story gallery' });
    }
    
    res.json({ 
        success: true, 
        photo,
        category,
        total: gallery[category].length
    });
});

// Delete photo from a category (admin only)
app.delete('/api/admin/story-gallery/:category/photos/:photoId', authenticate, requireAdmin, (req, res) => {
    const { category, photoId } = req.params;
    
    if (!STORY_GALLERY_CATEGORIES.includes(category)) {
        return res.status(400).json({ 
            error: 'Invalid category. Must be one of: ' + STORY_GALLERY_CATEGORIES.join(', ')
        });
    }
    
    const gallery = loadData(STORY_GALLERY_FILE, DEFAULT_STORY_GALLERY);
    
    if (!gallery[category]) {
        return res.status(404).json({ error: 'Category not found' });
    }
    
    const photoIndex = gallery[category].findIndex(p => p.id === photoId);
    if (photoIndex === -1) {
        return res.status(404).json({ error: 'Photo not found in category' });
    }
    
    const removedPhoto = gallery[category].splice(photoIndex, 1)[0];
    
    if (!saveData(STORY_GALLERY_FILE, gallery)) {
        return res.status(500).json({ error: 'Failed to save story gallery' });
    }
    
    res.json({ 
        success: true, 
        removedPhoto,
        category,
        remaining: gallery[category].length
    });
});

// ===========================
// SETTINGS API ROUTES (Categories & Badges)
// ===========================

// Get settings (public endpoint for categories and badges)
app.get('/api/settings', (req, res) => {
    const defaultSettings = {
        categories: [
            { id: 'dresses', name: 'Dresses', icon: '👗' },
            { id: 'tops', name: 'Tops', icon: '👚' },
            { id: 'skirts', name: 'Skirts', icon: '👗' },
            { id: 'sets', name: 'Sets', icon: '👕' }
        ],
        badges: [
            { id: 'bestseller', name: 'Bestseller', color: '#FF6B35', textColor: '#FFFFFF' },
            { id: 'new', name: 'New', color: '#4FA3C7', textColor: '#FFFFFF' },
            { id: 'limited', name: 'Limited', color: '#E87461', textColor: '#FFFFFF' },
            { id: 'featured', name: 'Featured', color: '#FFB347', textColor: '#000000' }
        ]
    };
    
    const settings = loadData(SETTINGS_FILE, defaultSettings);
    res.json(settings);
});

// Update settings (admin only)
app.post('/api/admin/settings', authenticate, requireAdmin, (req, res) => {
    const { categories, badges } = req.body;
    
    const settings = loadData(SETTINGS_FILE, {
        categories: [],
        badges: []
    });
    
    if (categories && Array.isArray(categories)) {
        for (const cat of categories) {
            if (!cat.id || !cat.name) {
                return res.status(400).json({ error: 'Each category must have id and name' });
            }
        }
        settings.categories = categories;
    }
    
    if (badges && Array.isArray(badges)) {
        for (const badge of badges) {
            if (!badge.id || !badge.name) {
                return res.status(400).json({ error: 'Each badge must have id and name' });
            }
        }
        settings.badges = badges;
    }
    
    if (!saveData(SETTINGS_FILE, settings)) {
        return res.status(500).json({ error: 'Failed to save settings' });
    }
    
    res.json({ 
        success: true, 
        settings,
        message: 'Settings updated successfully'
    });
});

// Add new category (admin only)
app.post('/api/admin/settings/categories', authenticate, requireAdmin, (req, res) => {
    const { id, name, icon } = req.body;
    
    if (!id || !name) {
        return res.status(400).json({ error: 'Category id and name are required' });
    }
    
    const settings = loadData(SETTINGS_FILE, {
        categories: [],
        badges: []
    });
    
    if (settings.categories.find(c => c.id === id)) {
        return res.status(400).json({ error: 'Category with this id already exists' });
    }
    
    const newCategory = { id, name, icon: icon || '📦' };
    settings.categories.push(newCategory);
    
    if (!saveData(SETTINGS_FILE, settings)) {
        return res.status(500).json({ error: 'Failed to save settings' });
    }
    
    res.json({ 
        success: true, 
        category: newCategory,
        categories: settings.categories
    });
});

// Delete category (admin only)
app.delete('/api/admin/settings/categories/:id', authenticate, requireAdmin, (req, res) => {
    const { id } = req.params;
    
    const settings = loadData(SETTINGS_FILE, {
        categories: [],
        badges: []
    });
    
    const categoryIndex = settings.categories.findIndex(c => c.id === id);
    if (categoryIndex === -1) {
        return res.status(404).json({ error: 'Category not found' });
    }
    
    const removedCategory = settings.categories.splice(categoryIndex, 1)[0];
    
    if (!saveData(SETTINGS_FILE, settings)) {
        return res.status(500).json({ error: 'Failed to save settings' });
    }
    
    res.json({ 
        success: true, 
        removedCategory,
        categories: settings.categories
    });
});

// Add new badge (admin only)
app.post('/api/admin/settings/badges', authenticate, requireAdmin, (req, res) => {
    const { id, name, color, textColor } = req.body;
    
    if (!id || !name) {
        return res.status(400).json({ error: 'Badge id and name are required' });
    }
    
    const settings = loadData(SETTINGS_FILE, {
        categories: [],
        badges: []
    });
    
    if (settings.badges.find(b => b.id === id)) {
        return res.status(400).json({ error: 'Badge with this id already exists' });
    }
    
    const newBadge = { 
        id, 
        name, 
        color: color || '#FF6B35', 
        textColor: textColor || '#FFFFFF' 
    };
    settings.badges.push(newBadge);
    
    if (!saveData(SETTINGS_FILE, settings)) {
        return res.status(500).json({ error: 'Failed to save settings' });
    }
    
    res.json({ 
        success: true, 
        badge: newBadge,
        badges: settings.badges
    });
});

// Delete badge (admin only)
app.delete('/api/admin/settings/badges/:id', authenticate, requireAdmin, (req, res) => {
    const { id } = req.params;
    
    const settings = loadData(SETTINGS_FILE, {
        categories: [],
        badges: []
    });
    
    const badgeIndex = settings.badges.findIndex(b => b.id === id);
    if (badgeIndex === -1) {
        return res.status(404).json({ error: 'Badge not found' });
    }
    
    const removedBadge = settings.badges.splice(badgeIndex, 1)[0];
    
    if (!saveData(SETTINGS_FILE, settings)) {
        return res.status(500).json({ error: 'Failed to save settings' });
    }
    
    res.json({ 
        success: true, 
        removedBadge,
        badges: settings.badges
    });
});

// Catch-all route - serve index.html for SPA routing (Express 5 syntax)
// Rate limited to prevent DoS attacks on file system operations
app.get('/{*splat}', rateLimit, (req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint not found' });
    } else if (req.path.startsWith('/admin')) {
        res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🧶 Menzah_fits Server running on port ${PORT}`);
    console.log(`📦 API available at http://localhost:${PORT}/api`);
    console.log(`🔐 Admin panel at http://localhost:${PORT}/admin`);
});

module.exports = app;
