/**
 * Menzah_fits Backend Server
 * Stock Management API for Crochet Fashion Business
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory (frontend)
app.use(express.static(path.join(__dirname, '..')));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// In-memory data store (replace with database in production)
let collections = [
    {
        id: '1',
        name: 'Ocean Breeze Maxi',
        category: 'dresses',
        price: 8500,
        priceFormatted: 'KES 8,500',
        colors: [
            { hex: '#2A7B9B', name: 'Ocean Blue', stock: 5 },
            { hex: '#E8DED1', name: 'Sand', stock: 3 },
            { hex: '#E87461', name: 'Coral', stock: 2 }
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
            { hex: '#E87461', name: 'Coral', stock: 8 },
            { hex: '#F09B8D', name: 'Light Coral', stock: 4 },
            { hex: '#C9BBA8', name: 'Taupe', stock: 6 }
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
            { hex: '#E8DED1', name: 'Sand', stock: 4 },
            { hex: '#8B7355', name: 'Natural', stock: 3 },
            { hex: '#FDF8F3', name: 'Cream', stock: 5 }
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
            { hex: '#2A7B9B', name: 'Ocean', stock: 2 },
            { hex: '#1E5A73', name: 'Deep Ocean', stock: 1 },
            { hex: '#E8DED1', name: 'Sand', stock: 3 }
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
            { hex: '#4FA3C7', name: 'Light Ocean', stock: 7 },
            { hex: '#2A7B9B', name: 'Ocean', stock: 5 },
            { hex: '#FDF8F3', name: 'Cream', stock: 4 }
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
            { hex: '#E87461', name: 'Coral', stock: 3 },
            { hex: '#D45341', name: 'Deep Coral', stock: 2 },
            { hex: '#E8DED1', name: 'Sand', stock: 4 }
        ],
        sizes: ['S', 'M', 'L'],
        description: 'Romantic crochet dress with coral accents',
        badge: 'featured',
        totalStock: 9,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// Simple admin authentication (use proper auth in production)
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'menzah-admin-2024';

// Auth middleware
const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token === ADMIN_TOKEN) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
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
    
    // Return public data without sensitive stock details
    const publicData = result.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        price: item.priceFormatted,
        colors: item.colors.map(c => c.hex),
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
        colors: item.colors.map(c => ({ hex: c.hex, name: c.name, available: c.stock > 0 })),
        sizes: item.sizes || [],
        description: item.description,
        badge: item.badge,
        inStock: item.totalStock > 0
    });
});

// ===========================
// ADMIN API ROUTES
// ===========================

// Admin login
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_TOKEN) {
        res.json({ success: true, token: ADMIN_TOKEN });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
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
    const { name, category, price, colors, description, badge } = req.body;
    
    if (!name || !category || !price || !colors || !description) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const totalStock = colors.reduce((sum, c) => sum + (c.stock || 0), 0);
    
    const newItem = {
        id: uuidv4(),
        name,
        category,
        price: Number(price),
        priceFormatted: `KES ${Number(price).toLocaleString()}`,
        colors,
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
    
    const { name, category, price, colors, description, badge } = req.body;
    const existing = collections[index];
    
    const updatedColors = colors || existing.colors;
    const totalStock = updatedColors.reduce((sum, c) => sum + (c.stock || 0), 0);
    
    collections[index] = {
        ...existing,
        name: name || existing.name,
        category: category || existing.category,
        price: price ? Number(price) : existing.price,
        priceFormatted: price ? `KES ${Number(price).toLocaleString()}` : existing.priceFormatted,
        colors: updatedColors,
        description: description || existing.description,
        badge: badge !== undefined ? badge : existing.badge,
        totalStock,
        updatedAt: new Date().toISOString()
    };
    
    res.json(collections[index]);
});

// Update stock for specific color (admin only)
app.patch('/api/admin/collections/:id/stock', authenticateAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const { colorHex, stock } = req.body;
    
    if (!colorHex || stock === undefined) {
        return res.status(400).json({ error: 'colorHex and stock are required' });
    }
    
    const colorIndex = collections[index].colors.findIndex(c => c.hex === colorHex);
    if (colorIndex === -1) {
        return res.status(404).json({ error: 'Color not found' });
    }
    
    collections[index].colors[colorIndex].stock = Number(stock);
    collections[index].totalStock = collections[index].colors.reduce((sum, c) => sum + c.stock, 0);
    collections[index].updatedAt = new Date().toISOString();
    
    res.json(collections[index]);
});

// Add new color to collection (admin only)
app.post('/api/admin/collections/:id/colors', authenticateAdmin, (req, res) => {
    const index = collections.findIndex(c => c.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: 'Collection not found' });
    }
    
    const { hex, name, stock } = req.body;
    
    if (!hex || !name) {
        return res.status(400).json({ error: 'hex and name are required' });
    }
    
    // Check if color already exists
    if (collections[index].colors.some(c => c.hex === hex)) {
        return res.status(400).json({ error: 'Color already exists' });
    }
    
    collections[index].colors.push({ hex, name, stock: stock || 0 });
    collections[index].totalStock = collections[index].colors.reduce((sum, c) => sum + c.stock, 0);
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
    collections[index].totalStock = collections[index].colors.reduce((sum, c) => sum + c.stock, 0);
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
