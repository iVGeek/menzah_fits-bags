/**
 * Menzah_fits Backend Server
 * Stock Management API for Crochet Fashion Business
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Secret key for token signing (use env variable in production)
const TOKEN_SECRET = process.env.TOKEN_SECRET || crypto.randomBytes(32).toString('hex');

// Simple password hashing using crypto
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
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

// Stricter rate limiter for authentication endpoints (prevent brute force)
const authRateLimitStore = new Map();
const AUTH_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_AUTH_REQUESTS = 10; // 10 auth requests per minute per IP

function authRateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!authRateLimitStore.has(ip)) {
        authRateLimitStore.set(ip, { count: 1, resetTime: now + AUTH_RATE_LIMIT_WINDOW });
        return next();
    }
    
    const record = authRateLimitStore.get(ip);
    
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + AUTH_RATE_LIMIT_WINDOW;
        return next();
    }
    
    if (record.count >= MAX_AUTH_REQUESTS) {
        return res.status(429).json({ error: 'Too many authentication attempts. Please try again later.' });
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
    for (const [ip, record] of authRateLimitStore.entries()) {
        if (now > record.resetTime) {
            authRateLimitStore.delete(ip);
        }
    }
}, RATE_LIMIT_WINDOW);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory (frontend)
app.use(express.static(path.join(__dirname, '..')));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// In-memory data store (replace with database in production)
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

let collections = [
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

// User roles hierarchy: dev_superior > admin > user
const USER_ROLES = {
    DEV_SUPERIOR: 'dev_superior',
    ADMIN: 'admin',
    USER: 'user'
};

// Default credentials from environment or fallback (for initial setup only)
const DEFAULT_DEV_PASSWORD = process.env.DEV_PASSWORD || 'dev@menzah2024';
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

// In-memory users store (replace with database in production)
// Passwords are hashed on server startup
let users = [
    {
        id: 'dev-001',
        username: 'devsuperior',
        password: hashPassword(DEFAULT_DEV_PASSWORD),
        role: USER_ROLES.DEV_SUPERIOR,
        name: 'Dev Superior',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'admin-001',
        username: 'admin',
        password: hashPassword(DEFAULT_ADMIN_PASSWORD),
        role: USER_ROLES.ADMIN,
        name: 'Administrator',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Generate secure token with HMAC signature
function generateToken(user) {
    const payload = JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });
    const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
    return Buffer.from(`${payload}.${signature}`).toString('base64');
}

// Parse and verify token
function parseToken(token) {
    try {
        const decoded = Buffer.from(token, 'base64').toString();
        const [payload, signature] = decoded.split(/\.(?=[^.]+$)/);
        
        // Verify signature
        const expectedSignature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex');
        if (signature !== expectedSignature) {
            return null;
        }
        
        const data = JSON.parse(payload);
        if (data.exp < Date.now()) {
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

// Auth middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const tokenData = parseToken(token);
    
    if (tokenData) {
        req.user = tokenData;
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Role-based access control middleware
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Dev superior has access to everything
        if (req.user.role === USER_ROLES.DEV_SUPERIOR) {
            return next();
        }
        
        if (allowedRoles.includes(req.user.role)) {
            return next();
        }
        
        res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    };
};

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
    
    // Return public data with color details including sizeStock
    const publicData = result.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.priceFormatted,
        colors: item.colors.map(c => ({ 
            hex: c.hex, 
            name: c.name, 
            sizeStock: c.sizeStock || {},
            stock: computeColorStock(c.sizeStock) // total stock for this color (for backward compatibility)
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
            stock: computeColorStock(c.sizeStock) // total stock for this color (for backward compatibility)
        })),
        sizes: item.sizes || [],
        description: item.description,
        badge: item.badge,
        inStock: item.totalStock > 0
    });
});

// ===========================
// ADMIN API ROUTES
// ===========================

// Admin login with username and password (rate limited to prevent brute force)
app.post('/api/admin/login', authRateLimit, (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username);
    
    if (user && verifyPassword(password, user.password)) {
        const token = generateToken(user);
        res.json({ 
            success: true, 
            token,
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        });
    } else {
        res.status(401).json({ error: 'Invalid username or password' });
    }
});

// Get current user info
app.get('/api/admin/me', authenticateAdmin, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
    });
});

// Change password (rate limited to prevent brute force)
app.post('/api/admin/change-password', authRateLimit, authenticateAdmin, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (!verifyPassword(currentPassword, users[userIndex].password)) {
        return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({ error: 'New password must be at least 4 characters' });
    }
    
    users[userIndex].password = hashPassword(newPassword);
    users[userIndex].updatedAt = new Date().toISOString();
    
    res.json({ success: true, message: 'Password changed successfully' });
});

// ===========================
// USER MANAGEMENT API ROUTES (admin and dev_superior only)
// ===========================

// Get all users (admin and dev_superior)
app.get('/api/admin/users', authenticateAdmin, requireRole(USER_ROLES.ADMIN, USER_ROLES.DEV_SUPERIOR), (req, res) => {
    // Filter out passwords and limit what admins can see
    const filteredUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt
    }));
    
    // Regular admins can't see dev_superior users
    if (req.user.role === USER_ROLES.ADMIN) {
        return res.json(filteredUsers.filter(u => u.role !== USER_ROLES.DEV_SUPERIOR));
    }
    
    res.json(filteredUsers);
});

// Create new user (admin can create users, dev_superior can create admins)
app.post('/api/admin/users', authenticateAdmin, requireRole(USER_ROLES.ADMIN, USER_ROLES.DEV_SUPERIOR), (req, res) => {
    const { username, password, name, role } = req.body;
    
    if (!username || !password || !name) {
        return res.status(400).json({ error: 'Username, password, and name are required' });
    }
    
    // Check if username already exists
    if (users.some(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Role validation
    let assignedRole = role || USER_ROLES.USER;
    
    // Only dev_superior can create admin users
    if (req.user.role === USER_ROLES.ADMIN) {
        if (assignedRole === USER_ROLES.DEV_SUPERIOR || assignedRole === USER_ROLES.ADMIN) {
            return res.status(403).json({ error: 'You cannot create admin or dev_superior users' });
        }
        assignedRole = USER_ROLES.USER;
    }
    
    // Prevent creating dev_superior users (only one allowed and it's pre-created)
    if (assignedRole === USER_ROLES.DEV_SUPERIOR) {
        return res.status(403).json({ error: 'Cannot create dev_superior accounts' });
    }
    
    const newUser = {
        id: uuidv4(),
        username,
        password: hashPassword(password),
        name,
        role: assignedRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.createdAt
    });
});

// Update user (limited by role hierarchy)
app.put('/api/admin/users/:id', authenticateAdmin, requireRole(USER_ROLES.ADMIN, USER_ROLES.DEV_SUPERIOR), (req, res) => {
    const { id } = req.params;
    const { name, password, role } = req.body;
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const targetUser = users[userIndex];
    
    // Cannot modify dev_superior unless you are dev_superior
    if (targetUser.role === USER_ROLES.DEV_SUPERIOR && req.user.role !== USER_ROLES.DEV_SUPERIOR) {
        return res.status(403).json({ error: 'Cannot modify dev_superior user' });
    }
    
    // Admin cannot modify other admins
    if (targetUser.role === USER_ROLES.ADMIN && req.user.role === USER_ROLES.ADMIN && targetUser.id !== req.user.id) {
        return res.status(403).json({ error: 'Cannot modify other admin users' });
    }
    
    // Update fields
    if (name) users[userIndex].name = name;
    if (password) users[userIndex].password = hashPassword(password);
    
    // Role changes only by dev_superior
    if (role && req.user.role === USER_ROLES.DEV_SUPERIOR) {
        // Still can't assign dev_superior role
        if (role === USER_ROLES.DEV_SUPERIOR) {
            return res.status(403).json({ error: 'Cannot assign dev_superior role' });
        }
        users[userIndex].role = role;
    }
    
    users[userIndex].updatedAt = new Date().toISOString();
    
    res.json({
        id: users[userIndex].id,
        username: users[userIndex].username,
        name: users[userIndex].name,
        role: users[userIndex].role,
        updatedAt: users[userIndex].updatedAt
    });
});

// Delete user (with role hierarchy restrictions)
app.delete('/api/admin/users/:id', authenticateAdmin, requireRole(USER_ROLES.ADMIN, USER_ROLES.DEV_SUPERIOR), (req, res) => {
    const { id } = req.params;
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    const targetUser = users[userIndex];
    
    // Cannot delete dev_superior
    if (targetUser.role === USER_ROLES.DEV_SUPERIOR) {
        return res.status(403).json({ error: 'Cannot delete dev_superior user' });
    }
    
    // Cannot delete yourself
    if (targetUser.id === req.user.id) {
        return res.status(403).json({ error: 'Cannot delete your own account' });
    }
    
    // Admin cannot delete other admins
    if (targetUser.role === USER_ROLES.ADMIN && req.user.role === USER_ROLES.ADMIN) {
        return res.status(403).json({ error: 'Cannot delete other admin users' });
    }
    
    users.splice(userIndex, 1);
    res.json({ success: true, message: 'User deleted successfully' });
});

// Get all collections with stock info (admin only)
app.get('/api/admin/collections', authenticateAdmin, (req, res) => {
    res.json(collections);
});

// Get single collection with stock (admin only)
app.get('/api/admin/collections/:id', authenticateAdmin, (req, res) => {
    const item = collections.find(c => c.id === req.params.id);
    if (!item) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    res.json(item);
});

// Create new collection (admin only)
app.post('/api/admin/collections', authenticateAdmin, (req, res) => {
    const { name, category, price, colors, sizes, description, badge } = req.body;
    
    if (!name || !category || !price || !colors || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Process colors to ensure they have sizeStock structure
    const processedColors = colors.map(c => ({
        hex: c.hex,
        name: c.name,
        sizeStock: c.sizeStock || {}
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
    res.status(201).json(newItem);
});

// Update collection (admin only)
app.put('/api/admin/collections/:id', authenticateAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const { name, category, price, colors, sizes, description, badge } = req.body;
    const existing = collections[index];
    
    // Process colors to ensure they have sizeStock structure
    let updatedColors;
    if (colors) {
        updatedColors = colors.map(c => ({
            hex: c.hex,
            name: c.name,
            sizeStock: c.sizeStock || {}
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
    
    res.json(collections[index]);
});

// Update stock for specific color and size (admin only)
app.patch('/api/admin/collections/:id/stock', authenticateAdmin, (req, res) => {
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
    
    res.json(collections[index]);
});

// Add new color to collection (admin only)
app.post('/api/admin/collections/:id/colors', authenticateAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const { hex, name, sizeStock } = req.body;
    
    if (!hex || !name) {
        return res.status(400).json({ error: 'hex and name are required' });
    }
    
    // Check if color already exists
    if (collections[index].colors.some(c => c.hex === hex)) {
        return res.status(400).json({ error: 'Color already exists' });
    }
    
    collections[index].colors.push({ hex, name, sizeStock: sizeStock || {} });
    collections[index].totalStock = computeTotalStock(collections[index].colors);
    collections[index].updatedAt = new Date().toISOString();
    
    res.json(collections[index]);
});

// Remove color from collection (admin only)
app.delete('/api/admin/collections/:id/colors/:colorHex', authenticateAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const colorHex = decodeURIComponent(req.params.colorHex);
    collections[index].colors = collections[index].colors.filter(c => c.hex !== colorHex);
    collections[index].totalStock = computeTotalStock(collections[index].colors);
    collections[index].updatedAt = new Date().toISOString();
    
    res.json(collections[index]);
});

// Delete collection (admin only)
app.delete('/api/admin/collections/:id', authenticateAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    collections.splice(index, 1);
    res.json({ success: true, message: 'Collection deleted' });
});

// Get inventory summary (admin only)
app.get('/api/admin/inventory', authenticateAdmin, (req, res) => {
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
