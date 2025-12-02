/**
 * Menzah_fits - Main JavaScript
 * Handcrafted Coastal Crochet Fashion
 * With API Integration for Stock Management
 */

(function() {
    'use strict';

    // =================================
    // Configuration
    // =================================
    
    const API_BASE = '/api';
    const PAGE_LOADER_TIMEOUT_MS = 5000; // Maximum time to show loading screen
    
    // =================================
    // Scroll Reset on Page Load
    // Reset scroll position immediately to ensure page starts at top
    // =================================
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    
    // =================================
    // Stock Helper Functions
    // =================================
    
    // Get CSS class for stock status
    function getStockClass(stock) {
        if (stock === 0) return 'out-of-stock';
        if (stock < 3) return 'low-stock';
        return 'in-stock';
    }
    
    // Format stock display text
    function formatStockText(name, stock) {
        const prefix = name ? `${name}: ` : '';
        const itemWord = stock === 1 ? 'item' : 'items';
        return `${prefix}${stock} ${itemWord}`;
    }
    
    // Check if API is available
    async function checkAPI() {
        try {
            const response = await fetch(`${API_BASE}/collections`);
            return response.ok;
        } catch {
            return false;
        }
    }

    // =================================
    // Data (Fallback if API unavailable)
    // =================================

    let collections = [
        {
            id: '1',
            name: 'Ocean Breeze Maxi',
            category: 'dresses',
            price: 'KES 8,500',
            colors: [
                { hex: '#2A7B9B', name: 'Ocean Blue', sizeStock: { 'S': 1, 'M': 2, 'L': 1, 'XL': 1 }, stock: 5, media: [] },
                { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 1, 'M': 1, 'L': 1, 'XL': 0 }, stock: 3, media: [] },
                { hex: '#E87461', name: 'Coral', sizeStock: { 'S': 0, 'M': 1, 'L': 1, 'XL': 0 }, stock: 2, media: [] }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Flowing maxi dress with intricate wave patterns',
            badge: 'bestseller',
        },
        {
            id: '2',
            name: 'Coral Sunset Top',
            category: 'tops',
            price: 'KES 4,200',
            colors: [
                { hex: '#E87461', name: 'Coral', sizeStock: { 'XS': 2, 'S': 2, 'M': 2, 'L': 2 }, stock: 8, media: [] },
                { hex: '#F09B8D', name: 'Light Coral', sizeStock: { 'XS': 1, 'S': 1, 'M': 1, 'L': 1 }, stock: 4, media: [] },
                { hex: '#C9BBA8', name: 'Taupe', sizeStock: { 'XS': 2, 'S': 1, 'M': 2, 'L': 1 }, stock: 6, media: [] }
            ],
            sizes: ['XS', 'S', 'M', 'L'],
            description: 'Lightweight crochet top perfect for warm evenings',
            badge: null,
        },
        {
            id: '3',
            name: 'Sandy Shores Dress',
            category: 'dresses',
            price: 'KES 7,800',
            colors: [
                { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 2, 'M': 1, 'L': 1 }, stock: 4, media: [] },
                { hex: '#8B7355', name: 'Natural', sizeStock: { 'S': 1, 'M': 1, 'L': 1 }, stock: 3, media: [] },
                { hex: '#FDF8F3', name: 'Cream', sizeStock: { 'S': 2, 'M': 2, 'L': 1 }, stock: 5, media: [] }
            ],
            sizes: ['S', 'M', 'L'],
            description: 'Elegant beach dress with natural fiber texture',
            badge: 'new',
        },
        {
            id: '4',
            name: 'Coastal Elegance Set',
            category: 'sets',
            price: 'KES 12,500',
            colors: [
                { hex: '#2A7B9B', name: 'Ocean', sizeStock: { 'S': 1, 'M': 0, 'L': 1, 'XL': 0 }, stock: 2, media: [] },
                { hex: '#1E5A73', name: 'Deep Ocean', sizeStock: { 'S': 0, 'M': 1, 'L': 0, 'XL': 0 }, stock: 1, media: [] },
                { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 1, 'M': 1, 'L': 1, 'XL': 0 }, stock: 3, media: [] }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Two-piece ensemble for special occasions',
            badge: 'limited',
        },
        {
            id: '5',
            name: 'Tidal Wave Skirt',
            category: 'skirts',
            price: 'KES 5,500',
            colors: [
                { hex: '#4FA3C7', name: 'Light Ocean', sizeStock: { 'XS': 1, 'S': 2, 'M': 2, 'L': 1, 'XL': 1 }, stock: 7, media: [] },
                { hex: '#2A7B9B', name: 'Ocean', sizeStock: { 'XS': 1, 'S': 1, 'M': 1, 'L': 1, 'XL': 1 }, stock: 5, media: [] },
                { hex: '#FDF8F3', name: 'Cream', sizeStock: { 'XS': 1, 'S': 1, 'M': 1, 'L': 1, 'XL': 0 }, stock: 4, media: [] }
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            description: 'Flowing midi skirt with wave-inspired patterns',
            badge: null,
        },
        {
            id: '6',
            name: 'Reef Romance Dress',
            category: 'dresses',
            price: 'KES 9,200',
            colors: [
                { hex: '#E87461', name: 'Coral', sizeStock: { 'S': 1, 'M': 1, 'L': 1 }, stock: 3, media: [] },
                { hex: '#D45341', name: 'Deep Coral', sizeStock: { 'S': 1, 'M': 1, 'L': 0 }, stock: 2, media: [] },
                { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 1, 'M': 2, 'L': 1 }, stock: 4, media: [] }
            ],
            sizes: ['S', 'M', 'L'],
            description: 'Romantic crochet dress with coral accents',
            badge: 'featured',
        },
    ];
    
    // Fetch collections from API
    async function fetchCollections(category = 'all') {
        try {
            const url = category === 'all' 
                ? `${API_BASE}/collections` 
                : `${API_BASE}/collections?category=${category}`;
            const response = await fetch(url);
            if (response.ok) {
                return await response.json();
            }
        } catch {
            // API unavailable, use local data
        }
        
        // Fallback to local data
        if (category === 'all') {
            return collections;
        }
        return collections.filter(item => item.category === category);
    }

    const testimonials = [
        {
            id: 1,
            name: 'Amina K.',
            location: 'Nairobi, Kenya',
            rating: 5,
            text: 'The Ocean Breeze Maxi dress exceeded all my expectations! The craftsmanship is impeccable, and I receive compliments every time I wear it. Truly a work of art.',
        },
        {
            id: 2,
            name: 'Sarah M.',
            location: 'Mombasa, Kenya',
            rating: 5,
            text: 'As someone who appreciates authentic Kenyan fashion, Menzah_fits delivers beyond imagination. My custom piece was delivered perfectly, matching every detail I requested.',
        },
        {
            id: 3,
            name: 'Grace O.',
            location: 'Kisumu, Kenya',
            rating: 5,
            text: 'I ordered a complete set for my beach wedding and it was absolutely stunning. The attention to detail and the quality of the crochet work is second to none.',
        },
        {
            id: 4,
            name: 'Diana W.',
            location: 'Malindi, Kenya',
            rating: 5,
            text: 'The comfort and elegance of my Menzah dress is unmatched. It breathes beautifully in our coastal climate while looking incredibly chic. Worth every shilling!',
        },
    ];

    // =================================
    // DOM Elements
    // =================================

    const header = document.getElementById('header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const collectionsGrid = document.getElementById('collections-grid');
    const testimonialContent = document.getElementById('testimonial-content');
    const testimonialDots = document.getElementById('testimonial-dots');
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const yearSpan = document.getElementById('year');

    // =================================
    // Header Scroll Effect
    // =================================

    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleHeaderScroll);
    handleHeaderScroll(); // Initial check

    // =================================
    // Mobile Menu Toggle
    // =================================

    function toggleMobileMenu() {
        mobileMenuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('open');
    }

    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Close mobile menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            mobileMenu.classList.remove('open');
        });
    });

    // =================================
    // Smooth Scroll for Navigation
    // =================================

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // =================================
    // Scroll Animations with Intersection Observer
    // =================================

    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.scroll-animate');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                } else {
                    // Remove visible class when element leaves viewport
                    // so animation replays when scrolling back
                    entry.target.classList.remove('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // =================================
    // Collections Grid
    // =================================

    function createCollectionCard(item, index) {
        const badgeClasses = {
            bestseller: 'badge-bestseller',
            new: 'badge-new',
            limited: 'badge-limited',
            featured: 'badge-featured'
        };

        const badgeHTML = item.badge 
            ? `<div class="card-badge ${badgeClasses[item.badge]}">${item.badge.charAt(0).toUpperCase() + item.badge.slice(1)}</div>`
            : '';

        // Handle both object format {hex, name, sizeStock} and legacy string format
        const getColorHex = (color) => typeof color === 'object' ? color.hex : color;
        const getColorName = (color) => typeof color === 'object' ? color.name : '';
        const getColorSizeStock = (color) => typeof color === 'object' ? (color.sizeStock || {}) : {};
        const getColorStock = (color) => typeof color === 'object' ? (color.stock || 0) : 0;
        const getColorMedia = (color) => typeof color === 'object' ? (color.media || []) : [];

        // Get the first size for initial display
        const firstSize = item.sizes && item.sizes.length > 0 ? item.sizes[0] : '';
        
        // Collect all media from all colors for the gallery
        const allMedia = item.colors.reduce((acc, color, colorIndex) => {
            const media = getColorMedia(color);
            media.forEach((m, mediaIndex) => {
                acc.push({
                    ...m,
                    colorIndex,
                    colorName: getColorName(color),
                    colorHex: getColorHex(color)
                });
            });
            return acc;
        }, []);
        
        const hasMedia = allMedia.length > 0;
        const firstColorMedia = getColorMedia(item.colors[0]);
        
        const colorsHTML = item.colors.map((color, i) => {
            const hex = getColorHex(color);
            const name = getColorName(color);
            const sizeStock = getColorSizeStock(color);
            const totalStock = getColorStock(color);
            const media = getColorMedia(color);
            const secondaryHex = getColorHex(item.colors[(i + 1) % item.colors.length]);
            const stockClass = getStockClass(totalStock);
            const activeClass = i === 0 ? ' active' : '';
            const ariaLabel = `${name || 'Color option ' + (i + 1)}: ${totalStock} in stock`;
            const title = `${name}: ${totalStock} in stock`;
            
            return `<button class="color-dot${activeClass} ${stockClass}" 
                style="background-color: ${hex}" 
                data-color="${hex}" 
                data-color-index="${i}"
                data-secondary-color="${secondaryHex}" 
                data-size-stock='${JSON.stringify(sizeStock)}' 
                data-color-name="${name}"
                data-media='${JSON.stringify(media)}'
                aria-label="${ariaLabel}" 
                title="${title}"></button>`;
        }).join('');

        const sizesHTML = (item.sizes && item.sizes.length > 0) ? item.sizes.map((size, i) => 
            `<button class="size-btn${i === 0 ? ' active' : ''}" data-size="${size}" aria-label="Size ${size}">${size}</button>`
        ).join('') : '';

        // Get first color info for SVG and stock display
        const firstColorHex = getColorHex(item.colors[0]);
        const secondColorHex = item.colors[1] ? getColorHex(item.colors[1]) : firstColorHex;
        const firstColorName = getColorName(item.colors[0]);
        const firstColorSizeStock = getColorSizeStock(item.colors[0]);
        const firstSizeStock = firstSize ? (firstColorSizeStock[firstSize] || 0) : getColorStock(item.colors[0]);

        // Generate media gallery HTML if media exists
        const generateMediaHTML = () => {
            if (!hasMedia) {
                // Fallback to SVG artwork
                return `
                    <div class="card-artwork">
                        <svg viewBox="0 0 200 280" class="card-artwork-svg">
                            <ellipse class="artwork-main" cx="100" cy="50" rx="25" ry="30" fill="${firstColorHex}" opacity="0.6"/>
                            <path class="artwork-body" d="M75 75 L55 280 L145 280 L125 75 Z" fill="${firstColorHex}" opacity="0.4"/>
                            ${[...Array(6)].map((_, row) => 
                                [...Array(4)].map((_, col) => 
                                    `<circle class="artwork-pattern" cx="${65 + col * 25}" cy="${95 + row * 28}" r="8" fill="none" stroke="${secondColorHex}" stroke-width="2" opacity="0.5"/>`
                                ).join('')
                            ).join('')}
                        </svg>
                    </div>`;
            }
            
            // Generate media gallery with carousel
            const mediaItems = firstColorMedia.length > 0 ? firstColorMedia : allMedia.slice(0, 5);
            const showCarousel = mediaItems.length > 1;
            
            return `
                <div class="card-media-gallery" data-current-index="0">
                    <div class="media-slides">
                        ${mediaItems.map((media, i) => {
                            if (media.type === 'video') {
                                return `<div class="media-slide${i === 0 ? ' active' : ''}" data-index="${i}">
                                    <video src="${media.url}" class="media-video" muted loop playsinline preload="metadata">
                                        <source src="${media.url}" type="video/mp4">
                                    </video>
                                    <div class="video-play-indicator">
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>`;
                            }
                            return `<div class="media-slide${i === 0 ? ' active' : ''}" data-index="${i}">
                                <img src="${media.url}" alt="${item.name} - ${media.colorName || 'Product image'}" class="media-image" loading="lazy">
                            </div>`;
                        }).join('')}
                    </div>
                    ${showCarousel ? `
                    <button class="gallery-nav gallery-prev" aria-label="Previous image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <button class="gallery-nav gallery-next" aria-label="Next image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                    <div class="gallery-dots">
                        ${mediaItems.map((_, i) => `<button class="gallery-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Go to image ${i + 1}"></button>`).join('')}
                    </div>
                    ` : ''}
                </div>
                <!-- Fallback SVG for color switching when no media for that color -->
                <div class="card-artwork card-artwork-fallback" style="display: none;">
                    <svg viewBox="0 0 200 280" class="card-artwork-svg">
                        <ellipse class="artwork-main" cx="100" cy="50" rx="25" ry="30" fill="${firstColorHex}" opacity="0.6"/>
                        <path class="artwork-body" d="M75 75 L55 280 L145 280 L125 75 Z" fill="${firstColorHex}" opacity="0.4"/>
                        ${[...Array(6)].map((_, row) => 
                            [...Array(4)].map((_, col) => 
                                `<circle class="artwork-pattern" cx="${65 + col * 25}" cy="${95 + row * 28}" r="8" fill="none" stroke="${secondColorHex}" stroke-width="2" opacity="0.5"/>`
                            ).join('')
                        ).join('')}
                    </svg>
                </div>`;
        };

        return `
            <div class="collection-card${hasMedia ? ' has-media' : ''}" data-item-id="${item.id}" style="transition-delay: ${index * 100}ms">
                <div class="card-image">
                    ${generateMediaHTML()}
                    ${badgeHTML}
                    <div class="card-overlay">
                        <button class="view-btn" aria-label="View ${item.name} details">View Details</button>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <div>
                            <span class="card-category">${item.category}</span>
                            <h3 class="card-name">${item.name}</h3>
                        </div>
                        <span class="card-price">${item.price}</span>
                    </div>
                    <p class="card-description">${item.description}</p>
                    <div class="card-options">
                        <div class="card-colors">
                            <span class="colors-label">Colors:</span>
                            ${colorsHTML}
                        </div>
                        ${sizesHTML ? `<div class="card-sizes">
                            <span class="sizes-label">Sizes:</span>
                            ${sizesHTML}
                        </div>` : ''}
                    </div>
                    <div class="card-stock-info">
                        <span class="stock-label">Stock:</span>
                        <span class="stock-value ${getStockClass(firstSizeStock)}" data-stock-display>${formatStockText(firstColorName + (firstSize ? ' - ' + firstSize : ''), firstSizeStock)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async function renderCollections(category = 'all') {
        // Show loading state with premium animation
        collectionsGrid.innerHTML = `
            <div class="loading-state">
                <div class="crochet-spinner"></div>
                <p class="loading-text">Loading collections...</p>
            </div>`;
        
        try {
            const filtered = await fetchCollections(category);
            
            // Store for modal access - always store all collections for modal lookup
            if (category === 'all') {
                currentCollections = filtered;
            } else {
                // Fetch all collections for modal lookup if filtered view
                const all = await fetchCollections('all');
                currentCollections = all;
            }
            
            // Check if there are any items to display
            if (!filtered || filtered.length === 0) {
                collectionsGrid.innerHTML = `
                    <div class="empty-state">
                        <svg class="empty-state-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/>
                        </svg>
                        <p class="empty-state-text">No items found</p>
                        <p class="empty-state-subtext">Try selecting a different category</p>
                    </div>`;
                return;
            }
            
            collectionsGrid.innerHTML = filtered.map((item, index) => 
                createCollectionCard(item, index)
            ).join('');

            // Animate cards in with staggered delay
            setTimeout(() => {
                document.querySelectorAll('.collection-card').forEach((card, i) => {
                    setTimeout(() => {
                        card.classList.add('visible');
                    }, i * 100);
                });
            }, 100);
            
            // Initialize color and size selection
            initCardInteractions();
        } catch {
            // Fallback to static data
            const filtered = category === 'all' 
                ? collections 
                : collections.filter(item => item.category === category);
            
            // Store all collections for modal access
            currentCollections = collections;
            
            collectionsGrid.innerHTML = filtered.map((item, index) => 
                createCollectionCard(item, index)
            ).join('');

            setTimeout(() => {
                document.querySelectorAll('.collection-card').forEach((card, i) => {
                    setTimeout(() => {
                        card.classList.add('visible');
                    }, i * 100);
                });
            }, 100);
            
            // Initialize color and size selection
            initCardInteractions();
        }
    }

    // =================================
    // Product Detail Modal
    // =================================
    
    // Store current collections data for modal access
    let currentCollections = [];
    
    // Create and inject the product detail modal into the DOM
    function createProductModal() {
        const modalHTML = `
            <div id="product-modal" class="product-modal" role="dialog" aria-modal="true" aria-labelledby="modal-product-name">
                <div class="product-modal-backdrop"></div>
                <div class="product-modal-container">
                    <button class="modal-close-btn" aria-label="Close product details">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                    <div class="modal-content">
                        <div class="modal-media">
                            <div class="modal-media-gallery" data-current-index="0">
                                <div class="modal-slides" id="modal-slides">
                                    <!-- Slides will be inserted here -->
                                </div>
                                <button class="modal-nav modal-prev" aria-label="Previous image">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
                                </button>
                                <button class="modal-nav modal-next" aria-label="Next image">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                                </button>
                                <div class="modal-dots" id="modal-dots">
                                    <!-- Dots will be inserted here -->
                                </div>
                            </div>
                        </div>
                        <div class="modal-details">
                            <div class="modal-badge" id="modal-badge"></div>
                            <span class="modal-category" id="modal-category"></span>
                            <h2 class="modal-product-name" id="modal-product-name"></h2>
                            <p class="modal-price" id="modal-price"></p>
                            <p class="modal-description" id="modal-description"></p>
                            
                            <div class="modal-options">
                                <div class="modal-colors">
                                    <span class="modal-option-label">Colors:</span>
                                    <div class="modal-color-options" id="modal-colors"></div>
                                </div>
                                <div class="modal-sizes">
                                    <span class="modal-option-label">Sizes:</span>
                                    <div class="modal-size-options" id="modal-sizes"></div>
                                </div>
                            </div>
                            
                            <div class="modal-stock">
                                <span class="modal-stock-label">Availability:</span>
                                <span class="modal-stock-value" id="modal-stock"></span>
                            </div>
                            
                            <div class="modal-actions">
                                <a href="#contact" class="btn-primary modal-order-btn" id="modal-order-btn">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                    Order This Item
                                </a>
                                <a href="https://wa.me/254700000000?text=Hello%20Menzah_fits!%20I%20would%20like%20to%20order%20" 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   class="btn-secondary modal-whatsapp-btn" 
                                   id="modal-whatsapp-btn">
                                    <svg fill="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    Chat on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        initModalEventListeners();
    }
    
    // Initialize modal event listeners
    function initModalEventListeners() {
        const modal = document.getElementById('product-modal');
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.modal-close-btn');
        const backdrop = modal.querySelector('.product-modal-backdrop');
        
        // Close modal handlers
        closeBtn.onclick = closeProductModal;
        backdrop.onclick = closeProductModal;
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) {
                closeProductModal();
            }
        });
        
        // Modal gallery navigation
        const gallery = modal.querySelector('.modal-media-gallery');
        const prevBtn = modal.querySelector('.modal-prev');
        const nextBtn = modal.querySelector('.modal-next');
        
        prevBtn.onclick = () => navigateModalGallery(-1);
        nextBtn.onclick = () => navigateModalGallery(1);
    }
    
    // Navigate modal gallery
    function navigateModalGallery(direction) {
        const gallery = document.querySelector('.modal-media-gallery');
        const slides = gallery.querySelectorAll('.modal-slide');
        const dots = gallery.querySelectorAll('.modal-dot');
        
        if (slides.length <= 1) return;
        
        let currentIndex = parseInt(gallery.dataset.currentIndex || '0', 10);
        currentIndex += direction;
        
        if (currentIndex < 0) currentIndex = slides.length - 1;
        if (currentIndex >= slides.length) currentIndex = 0;
        
        slides.forEach((slide, i) => slide.classList.toggle('active', i === currentIndex));
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        gallery.dataset.currentIndex = currentIndex.toString();
    }
    
    // Open product modal with item details
    function openProductModal(itemId) {
        const item = currentCollections.find(c => c.id === itemId);
        if (!item) return;
        
        const modal = document.getElementById('product-modal');
        if (!modal) return;
        
        // Helper functions
        const getColorHex = (color) => typeof color === 'object' ? color.hex : color;
        const getColorName = (color) => typeof color === 'object' ? color.name : '';
        const getColorSizeStock = (color) => typeof color === 'object' ? (color.sizeStock || {}) : {};
        const getColorStock = (color) => typeof color === 'object' ? (color.stock || 0) : 0;
        const getColorMedia = (color) => typeof color === 'object' ? (color.media || []) : [];
        
        // Populate modal content
        document.getElementById('modal-category').textContent = item.category;
        document.getElementById('modal-product-name').textContent = item.name;
        document.getElementById('modal-price').textContent = item.price;
        document.getElementById('modal-description').textContent = item.description;
        
        // Badge
        const badgeEl = document.getElementById('modal-badge');
        if (item.badge) {
            badgeEl.textContent = item.badge.charAt(0).toUpperCase() + item.badge.slice(1);
            badgeEl.className = `modal-badge badge-${item.badge}`;
            badgeEl.style.display = '';
        } else {
            badgeEl.style.display = 'none';
        }
        
        // Colors
        const colorsContainer = document.getElementById('modal-colors');
        colorsContainer.innerHTML = item.colors.map((color, i) => {
            const hex = getColorHex(color);
            const name = getColorName(color);
            const totalStock = getColorStock(color);
            const stockClass = getStockClass(totalStock);
            const activeClass = i === 0 ? ' active' : '';
            return `<button class="modal-color-dot${activeClass} ${stockClass}" 
                style="background-color: ${hex}" 
                data-color-index="${i}"
                data-color-name="${name}"
                data-size-stock='${JSON.stringify(getColorSizeStock(color))}'
                data-media='${JSON.stringify(getColorMedia(color))}'
                aria-label="${name}: ${totalStock} in stock" 
                title="${name}: ${totalStock} in stock"></button>`;
        }).join('');
        
        // Sizes
        const sizesContainer = document.getElementById('modal-sizes');
        sizesContainer.innerHTML = item.sizes.map((size, i) => 
            `<button class="modal-size-btn${i === 0 ? ' active' : ''}" data-size="${size}">${size}</button>`
        ).join('');
        
        // Initial stock display
        updateModalStock();
        
        // Generate media gallery
        updateModalMedia(item.colors[0]);
        
        // Update WhatsApp link
        const whatsappBtn = document.getElementById('modal-whatsapp-btn');
        whatsappBtn.href = `https://wa.me/254700000000?text=Hello%20Menzah_fits!%20I%20would%20like%20to%20order%20${encodeURIComponent(item.name)}%20(${encodeURIComponent(item.price)})`;
        
        // Add modal color/size interaction handlers
        initModalInteractions();
        
        // Show modal
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
    
    // Update modal media gallery
    function updateModalMedia(color) {
        const getColorMedia = (color) => typeof color === 'object' ? (color.media || []) : [];
        const getColorHex = (color) => typeof color === 'object' ? color.hex : color;
        const getColorName = (color) => typeof color === 'object' ? color.name : '';
        
        const media = getColorMedia(color);
        const slidesContainer = document.getElementById('modal-slides');
        const dotsContainer = document.getElementById('modal-dots');
        const gallery = document.querySelector('.modal-media-gallery');
        const prevBtn = document.querySelector('.modal-prev');
        const nextBtn = document.querySelector('.modal-next');
        
        if (media.length > 0) {
            slidesContainer.innerHTML = media.map((m, i) => {
                if (m.type === 'video') {
                    return `<div class="modal-slide${i === 0 ? ' active' : ''}" data-index="${i}">
                        <video src="${m.url}" class="modal-video" controls muted playsinline>
                            <source src="${m.url}" type="video/mp4">
                        </video>
                    </div>`;
                }
                return `<div class="modal-slide${i === 0 ? ' active' : ''}" data-index="${i}">
                    <img src="${m.url}" alt="${getColorName(color)} - Image ${i + 1}" class="modal-image">
                </div>`;
            }).join('');
            
            dotsContainer.innerHTML = media.map((_, i) => 
                `<button class="modal-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Go to image ${i + 1}"></button>`
            ).join('');
            
            prevBtn.style.display = media.length > 1 ? '' : 'none';
            nextBtn.style.display = media.length > 1 ? '' : 'none';
            dotsContainer.style.display = media.length > 1 ? '' : 'none';
            
            // Bind dot click events
            dotsContainer.querySelectorAll('.modal-dot').forEach((dot, index) => {
                dot.onclick = () => {
                    const slides = slidesContainer.querySelectorAll('.modal-slide');
                    const dots = dotsContainer.querySelectorAll('.modal-dot');
                    slides.forEach((s, i) => s.classList.toggle('active', i === index));
                    dots.forEach((d, i) => d.classList.toggle('active', i === index));
                    gallery.dataset.currentIndex = index.toString();
                };
            });
        } else {
            // Fallback SVG for products without media
            const colorHex = getColorHex(color);
            slidesContainer.innerHTML = `
                <div class="modal-slide active" data-index="0">
                    <div class="modal-artwork">
                        <svg viewBox="0 0 200 280" class="modal-artwork-svg">
                            <ellipse cx="100" cy="50" rx="25" ry="30" fill="${colorHex}" opacity="0.6"/>
                            <path d="M75 75 L55 280 L145 280 L125 75 Z" fill="${colorHex}" opacity="0.4"/>
                            ${[...Array(6)].map((_, row) => 
                                [...Array(4)].map((_, col) => 
                                    `<circle cx="${65 + col * 25}" cy="${95 + row * 28}" r="8" fill="none" stroke="${colorHex}" stroke-width="2" opacity="0.5"/>`
                                ).join('')
                            ).join('')}
                        </svg>
                    </div>
                </div>`;
            dotsContainer.innerHTML = '';
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            dotsContainer.style.display = 'none';
        }
        
        gallery.dataset.currentIndex = '0';
    }
    
    // Update modal stock display
    function updateModalStock() {
        const activeColor = document.querySelector('.modal-color-dot.active');
        const activeSize = document.querySelector('.modal-size-btn.active');
        const stockDisplay = document.getElementById('modal-stock');
        
        if (!activeColor || !stockDisplay) return;
        
        const colorName = activeColor.dataset.colorName || '';
        let sizeStock = {};
        try {
            sizeStock = JSON.parse(activeColor.dataset.sizeStock || '{}');
        } catch {
            sizeStock = {};
        }
        
        const selectedSize = activeSize ? activeSize.dataset.size : '';
        let stock = 0;
        let displayLabel = colorName;
        
        if (selectedSize && sizeStock[selectedSize] !== undefined) {
            stock = parseInt(sizeStock[selectedSize], 10) || 0;
            displayLabel = colorName + ' - ' + selectedSize;
        } else {
            stock = Object.values(sizeStock).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
        }
        
        stockDisplay.textContent = formatStockText(displayLabel, stock);
        stockDisplay.className = `modal-stock-value ${getStockClass(stock)}`;
    }
    
    // Initialize modal color/size interactions
    function initModalInteractions() {
        const colorDots = document.querySelectorAll('.modal-color-dot');
        const sizeBtns = document.querySelectorAll('.modal-size-btn');
        
        colorDots.forEach(dot => {
            dot.onclick = () => {
                colorDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
                
                // Update media for selected color
                let media = [];
                try {
                    media = JSON.parse(dot.dataset.media || '[]');
                } catch {
                    media = [];
                }
                
                const colorObj = {
                    hex: dot.style.backgroundColor,
                    name: dot.dataset.colorName,
                    media: media
                };
                updateModalMedia(colorObj);
                updateModalStock();
            };
        });
        
        sizeBtns.forEach(btn => {
            btn.onclick = () => {
                sizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                updateModalStock();
            };
        });
    }
    
    // Close product modal
    function closeProductModal() {
        const modal = document.getElementById('product-modal');
        if (!modal) return;
        
        modal.classList.remove('open');
        document.body.style.overflow = '';
        
        // Pause any playing videos
        modal.querySelectorAll('video').forEach(v => v.pause());
    }
    
    // Initialize View Details button handlers
    function initViewDetailsButtons() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const card = btn.closest('.collection-card');
                if (card) {
                    const itemId = card.dataset.itemId;
                    openProductModal(itemId);
                }
            };
        });
    }

    // Initialize color switching and size selection interactions
    function initCardInteractions() {
        // Initialize view details buttons
        initViewDetailsButtons();
        
        // Color switching functionality
        document.querySelectorAll('.collection-card').forEach(card => {
            const colorDots = card.querySelectorAll('.color-dot');
            const sizeBtns = card.querySelectorAll('.size-btn');
            const artworkSvg = card.querySelector('.card-artwork-svg');
            const stockDisplay = card.querySelector('[data-stock-display]');
            const mediaGallery = card.querySelector('.card-media-gallery');
            const artworkFallback = card.querySelector('.card-artwork-fallback');
            
            // Initialize media gallery carousel if present
            if (mediaGallery) {
                initMediaGallery(mediaGallery);
            }
            
            // Helper function to update stock display based on selected color and size
            function updateStockDisplay() {
                const activeColor = card.querySelector('.color-dot.active');
                const activeSize = card.querySelector('.size-btn.active');
                
                if (!activeColor || !stockDisplay) return;
                
                const colorName = activeColor.dataset.colorName || '';
                let sizeStock = {};
                try {
                    sizeStock = JSON.parse(activeColor.dataset.sizeStock || '{}');
                } catch {
                    sizeStock = {};
                }
                
                const selectedSize = activeSize ? activeSize.dataset.size : '';
                let stock = 0;
                let displayLabel = colorName;
                
                if (selectedSize && sizeStock[selectedSize] !== undefined) {
                    stock = parseInt(sizeStock[selectedSize], 10) || 0;
                    displayLabel = colorName + ' - ' + selectedSize;
                } else {
                    // If no size selected or size not found, show total for color
                    stock = Object.values(sizeStock).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
                }
                
                stockDisplay.textContent = formatStockText(displayLabel, stock);
                stockDisplay.className = `stock-value ${getStockClass(stock)}`;
            }
            
            // Helper function to update media gallery when color changes
            function updateMediaForColor(dot) {
                if (!mediaGallery) return;
                
                let colorMedia = [];
                try {
                    colorMedia = JSON.parse(dot.dataset.media || '[]');
                } catch (e) {
                    console.warn('Failed to parse media data:', e);
                    colorMedia = [];
                }
                
                const colorName = dot.dataset.colorName || 'Product';
                const slidesContainer = mediaGallery.querySelector('.media-slides');
                const dotsContainer = mediaGallery.querySelector('.gallery-dots');
                const prevBtn = mediaGallery.querySelector('.gallery-prev');
                const nextBtn = mediaGallery.querySelector('.gallery-next');
                
                if (colorMedia.length > 0) {
                    // Show media gallery, hide fallback
                    mediaGallery.style.display = '';
                    if (artworkFallback) artworkFallback.style.display = 'none';
                    
                    // Update slides with descriptive alt text
                    slidesContainer.innerHTML = colorMedia.map((media, i) => {
                        const altText = `${colorName} variant - Image ${i + 1} of ${colorMedia.length}`;
                        if (media.type === 'video') {
                            return `<div class="media-slide${i === 0 ? ' active' : ''}" data-index="${i}">
                                <video src="${media.url}" class="media-video" muted loop playsinline preload="metadata" aria-label="${altText}">
                                    <source src="${media.url}" type="video/mp4">
                                </video>
                                <div class="video-play-indicator">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                </div>
                            </div>`;
                        }
                        return `<div class="media-slide${i === 0 ? ' active' : ''}" data-index="${i}">
                            <img src="${media.url}" alt="${altText}" class="media-image" loading="lazy">
                        </div>`;
                    }).join('');
                    
                    // Update dots
                    if (dotsContainer) {
                        if (colorMedia.length > 1) {
                            dotsContainer.style.display = '';
                            dotsContainer.innerHTML = colorMedia.map((_, i) => 
                                `<button class="gallery-dot${i === 0 ? ' active' : ''}" data-index="${i}" aria-label="Go to image ${i + 1}"></button>`
                            ).join('');
                        } else {
                            dotsContainer.style.display = 'none';
                        }
                    }
                    
                    // Update navigation visibility
                    if (prevBtn) prevBtn.style.display = colorMedia.length > 1 ? '' : 'none';
                    if (nextBtn) nextBtn.style.display = colorMedia.length > 1 ? '' : 'none';
                    
                    // Reset gallery index and rebind events
                    mediaGallery.dataset.currentIndex = '0';
                    
                    // Rebind gallery event listeners (DOM was replaced, so new elements need handlers)
                    bindGalleryEvents(mediaGallery);
                } else {
                    // No media for this color - show fallback SVG
                    mediaGallery.style.display = 'none';
                    if (artworkFallback) {
                        artworkFallback.style.display = '';
                        // Update SVG colors
                        const mainColor = dot.dataset.color;
                        const secondaryColor = dot.dataset.secondaryColor;
                        const svg = artworkFallback.querySelector('.card-artwork-svg');
                        if (svg) {
                            svg.querySelectorAll('.artwork-main, .artwork-body').forEach(el => {
                                el.setAttribute('fill', mainColor);
                            });
                            svg.querySelectorAll('.artwork-pattern').forEach(el => {
                                el.setAttribute('stroke', secondaryColor);
                            });
                        }
                    }
                }
            }
            
            colorDots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Get sizeStock for this color
                    let sizeStock = {};
                    try {
                        sizeStock = JSON.parse(dot.dataset.sizeStock || '{}');
                    } catch {
                        sizeStock = {};
                    }
                    
                    // Calculate total stock for this color
                    const totalStock = Object.values(sizeStock).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0);
                    
                    // Prevent selection of out-of-stock colors
                    if (totalStock === 0) {
                        // Use CSS class for disabled feedback animation
                        dot.classList.add('click-disabled');
                        // Use transitionend to clean up, with fallback timeout
                        const cleanup = () => dot.classList.remove('click-disabled');
                        dot.addEventListener('transitionend', cleanup, { once: true });
                        setTimeout(cleanup, 200); // Fallback cleanup
                        return;
                    }
                    
                    // Update active state for color dots
                    colorDots.forEach(d => d.classList.remove('active'));
                    dot.classList.add('active');
                    
                    // Get the selected colors
                    const mainColor = dot.dataset.color;
                    const secondaryColor = dot.dataset.secondaryColor;
                    
                    // Update media gallery for the selected color
                    updateMediaForColor(dot);
                    
                    // Update SVG artwork colors with smooth transition (for non-media cards)
                    if (artworkSvg && !mediaGallery) {
                        const mainElements = artworkSvg.querySelectorAll('.artwork-main, .artwork-body');
                        const patternElements = artworkSvg.querySelectorAll('.artwork-pattern');
                        
                        mainElements.forEach(el => {
                            el.style.transition = 'fill 0.3s ease';
                            el.setAttribute('fill', mainColor);
                        });
                        
                        patternElements.forEach(el => {
                            el.style.transition = 'stroke 0.3s ease';
                            el.setAttribute('stroke', secondaryColor);
                        });
                    }
                    
                    // Update stock display for selected color and size
                    updateStockDisplay();
                });
            });
            
            // Size selection functionality
            sizeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Update active state for size buttons
                    sizeBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Update stock display when size changes
                    updateStockDisplay();
                });
            });
        });
    }
    
    // Bind gallery events to elements (using onclick to avoid event accumulation)
    function bindGalleryEvents(gallery) {
        const slides = gallery.querySelectorAll('.media-slide');
        const dots = gallery.querySelectorAll('.gallery-dot');
        const prevBtn = gallery.querySelector('.gallery-prev');
        const nextBtn = gallery.querySelector('.gallery-next');
        
        if (slides.length <= 1) return;
        
        function goToSlide(index) {
            const currentSlides = gallery.querySelectorAll('.media-slide');
            const currentDots = gallery.querySelectorAll('.gallery-dot');
            const totalSlides = currentSlides.length;
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            
            currentSlides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
                // Pause videos that aren't active
                const video = slide.querySelector('video');
                if (video && i !== index) {
                    video.pause();
                }
            });
            
            currentDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            
            gallery.dataset.currentIndex = index.toString();
        }
        
        // Previous button (using onclick replaces existing handler, avoids accumulation)
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const currentIndex = parseInt(gallery.dataset.currentIndex || '0', 10);
                goToSlide(currentIndex - 1);
            };
        }
        
        // Next button
        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                const currentIndex = parseInt(gallery.dataset.currentIndex || '0', 10);
                goToSlide(currentIndex + 1);
            };
        }
        
        // Dot navigation
        dots.forEach((dot, index) => {
            dot.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(index);
            };
        });
        
        // Video play on click
        slides.forEach(slide => {
            const video = slide.querySelector('video');
            const playIndicator = slide.querySelector('.video-play-indicator');
            if (video && playIndicator) {
                slide.onclick = (e) => {
                    e.stopPropagation();
                    if (video.paused) {
                        video.play();
                        playIndicator.style.opacity = '0';
                    } else {
                        video.pause();
                        playIndicator.style.opacity = '1';
                    }
                };
                
                video.onended = () => {
                    playIndicator.style.opacity = '1';
                };
            }
        });
    }
    
    // Initialize media gallery carousel (calls bindGalleryEvents)
    function initMediaGallery(gallery) {
        bindGalleryEvents(gallery);
    }

    // Category filter buttons
    function initCategoryFilter() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderCollections(btn.dataset.category);
            });
        });
    }

    // =================================
    // Testimonials Carousel
    // =================================

    let currentTestimonial = 0;
    let testimonialInterval;

    function createTestimonialItem(testimonial, isActive) {
        const stars = [...Array(testimonial.rating)].map(() => 
            `<svg class="star-icon" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>`
        ).join('');

        return `
            <div class="testimonial-item ${isActive ? 'active' : ''}" data-index="${testimonial.id - 1}">
                <div class="testimonial-rating">${stars}</div>
                <p class="testimonial-text">"${testimonial.text}"</p>
                <div class="testimonial-author">
                    <div class="author-avatar">${testimonial.name.charAt(0)}</div>
                    <div>
                        <h4 class="author-name">${testimonial.name}</h4>
                        <p class="author-location">${testimonial.location}</p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderTestimonials() {
        // Render all testimonial items
        testimonialContent.innerHTML = testimonials.map((t, i) => 
            createTestimonialItem(t, i === 0)
        ).join('');

        // Render dots
        testimonialDots.innerHTML = testimonials.map((_, i) => 
            `<button class="dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="View testimonial ${i + 1}"></button>`
        ).join('');

        // Add dot click handlers
        testimonialDots.querySelectorAll('.dot').forEach(dot => {
            dot.addEventListener('click', () => {
                goToTestimonial(parseInt(dot.dataset.index));
            });
        });
    }

    function goToTestimonial(index) {
        currentTestimonial = index;
        
        // Update active testimonial
        document.querySelectorAll('.testimonial-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });

        // Update dots
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    function nextTestimonial() {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        goToTestimonial(currentTestimonial);
    }

    function startTestimonialAutoplay() {
        testimonialInterval = setInterval(nextTestimonial, 5000);
    }

    function stopTestimonialAutoplay() {
        clearInterval(testimonialInterval);
    }

    // Pause autoplay on hover
    function initTestimonialHover() {
        const testimonialCard = document.querySelector('.testimonial-card');
        if (testimonialCard) {
            testimonialCard.addEventListener('mouseenter', stopTestimonialAutoplay);
            testimonialCard.addEventListener('mouseleave', startTestimonialAutoplay);
        }
    }

    // =================================
    // Contact Form
    // =================================

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const submitText = submitBtn.querySelector('.submit-text');
        const submitSending = submitBtn.querySelector('.submit-sending');
        const submitSuccess = submitBtn.querySelector('.submit-success');
        
        // Show sending state
        submitBtn.disabled = true;
        submitBtn.classList.add('sending');
        submitText.style.display = 'none';
        submitSending.style.display = 'flex';
        
        // Simulate form submission
        setTimeout(() => {
            submitBtn.classList.remove('sending');
            submitBtn.classList.add('success');
            submitSending.style.display = 'none';
            submitSuccess.style.display = 'flex';
            
            // Reset form
            contactForm.reset();
            
            // Reset button after delay
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.classList.remove('success');
                submitSuccess.style.display = 'none';
                submitText.style.display = 'inline';
            }, 3000);
        }, 1500);
    }

    contactForm.addEventListener('submit', handleFormSubmit);

    // =================================
    // Footer Year
    // =================================

    yearSpan.textContent = new Date().getFullYear();

    // =================================
    // Scroll Progress Indicator
    // =================================
    
    function initScrollProgress() {
        // Create scroll progress element
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.prepend(progressBar);
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        });
    }

    // =================================
    // Enhanced Crochet Animations
    // =================================
    
    function initCrochetAnimations() {
        // Add float animation to decorative elements
        document.querySelectorAll('.about-accent-1, .about-accent-2').forEach((el, i) => {
            el.classList.add('animate-float');
            el.style.animationDelay = `${i * 0.5}s`;
        });
        
        // Add yarn spin to hero elements
        const heroYarn = document.querySelector('.hero-yarn');
        if (heroYarn) {
            heroYarn.classList.add('animate-yarn-spin');
        }
        
        // Add stitch animation to pattern backgrounds
        document.querySelectorAll('.hero-pattern, .testimonials-pattern').forEach(el => {
            el.classList.add('crochet-bg');
        });
    }

    // =================================
    // Initialize
    // =================================

    // =================================
    // Page Loader Management
    // =================================
    
    const pageLoader = document.getElementById('page-loader');
    
    function hidePageLoader() {
        if (pageLoader) {
            // Add a small delay for smooth transition
            setTimeout(() => {
                pageLoader.classList.add('hidden');
                // Remove from DOM after transition
                setTimeout(() => {
                    pageLoader.style.display = 'none';
                }, 500);
            }, 500);
        }
    }
    
    function showPageLoader() {
        if (pageLoader) {
            pageLoader.style.display = 'flex';
            pageLoader.classList.remove('hidden');
        }
    }

    async function init() {
        // Initialize scroll progress
        initScrollProgress();
        
        // Initialize crochet animations
        initCrochetAnimations();
        
        // Create product detail modal
        createProductModal();
        
        // Load and render collections
        await renderCollections();
        initCategoryFilter();
        
        // Initialize testimonials
        renderTestimonials();
        startTestimonialAutoplay();
        initTestimonialHover();
        
        // Initialize scroll animations
        initScrollAnimations();
        
        // Check API availability
        const apiAvailable = await checkAPI();
        if (apiAvailable) {
            console.log('🧶 Menzah_fits API connected');
        } else {
            console.log('📦 Running in static mode');
        }
        
        // Hide the page loader after everything is initialized
        hidePageLoader();
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Fallback: Hide loader after max wait time (in case of slow networks)
    setTimeout(() => {
        hidePageLoader();
    }, PAGE_LOADER_TIMEOUT_MS);

})();
