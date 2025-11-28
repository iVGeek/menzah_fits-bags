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
            id: 1,
            name: 'Ocean Breeze Maxi',
            category: 'dresses',
            price: 'KES 8,500',
            colors: [
                { hex: '#2A7B9B', name: 'Ocean Blue', sizeStock: { 'S': 1, 'M': 2, 'L': 1, 'XL': 1 }, stock: 5 },
                { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 1, 'M': 1, 'L': 1, 'XL': 0 }, stock: 3 },
                { hex: '#E87461', name: 'Coral', sizeStock: { 'S': 0, 'M': 1, 'L': 1, 'XL': 0 }, stock: 2 }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Flowing maxi dress with intricate wave patterns',
            badge: 'bestseller',
        },
        {
            id: 2,
            name: 'Coral Sunset Top',
            category: 'tops',
            price: 'KES 4,200',
            colors: [
                { hex: '#E87461', name: 'Coral', sizeStock: { 'XS': 2, 'S': 2, 'M': 2, 'L': 2 }, stock: 8 },
                { hex: '#F09B8D', name: 'Light Coral', sizeStock: { 'XS': 1, 'S': 1, 'M': 1, 'L': 1 }, stock: 4 },
                { hex: '#C9BBA8', name: 'Taupe', sizeStock: { 'XS': 2, 'S': 1, 'M': 2, 'L': 1 }, stock: 6 }
            ],
            sizes: ['XS', 'S', 'M', 'L'],
            description: 'Lightweight crochet top perfect for warm evenings',
            badge: null,
        },
        {
            id: 3,
            name: 'Sandy Shores Dress',
            category: 'dresses',
            price: 'KES 7,800',
            colors: [
                { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 2, 'M': 1, 'L': 1 }, stock: 4 },
                { hex: '#8B7355', name: 'Natural', sizeStock: { 'S': 1, 'M': 1, 'L': 1 }, stock: 3 },
                { hex: '#FDF8F3', name: 'Cream', sizeStock: { 'S': 2, 'M': 2, 'L': 1 }, stock: 5 }
            ],
            sizes: ['S', 'M', 'L'],
            description: 'Elegant beach dress with natural fiber texture',
            badge: 'new',
        },
        {
            id: 4,
            name: 'Coastal Elegance Set',
            category: 'sets',
            price: 'KES 12,500',
            colors: [
                { hex: '#2A7B9B', name: 'Ocean', sizeStock: { 'S': 1, 'M': 0, 'L': 1, 'XL': 0 }, stock: 2 },
                { hex: '#1E5A73', name: 'Deep Ocean', sizeStock: { 'S': 0, 'M': 1, 'L': 0, 'XL': 0 }, stock: 1 },
                { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 1, 'M': 1, 'L': 1, 'XL': 0 }, stock: 3 }
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            description: 'Two-piece ensemble for special occasions',
            badge: 'limited',
        },
        {
            id: 5,
            name: 'Tidal Wave Skirt',
            category: 'skirts',
            price: 'KES 5,500',
            colors: [
                { hex: '#4FA3C7', name: 'Light Ocean', sizeStock: { 'XS': 1, 'S': 2, 'M': 2, 'L': 1, 'XL': 1 }, stock: 7 },
                { hex: '#2A7B9B', name: 'Ocean', sizeStock: { 'XS': 1, 'S': 1, 'M': 1, 'L': 1, 'XL': 1 }, stock: 5 },
                { hex: '#FDF8F3', name: 'Cream', sizeStock: { 'XS': 1, 'S': 1, 'M': 1, 'L': 1, 'XL': 0 }, stock: 4 }
            ],
            sizes: ['XS', 'S', 'M', 'L', 'XL'],
            description: 'Flowing midi skirt with wave-inspired patterns',
            badge: null,
        },
        {
            id: 6,
            name: 'Reef Romance Dress',
            category: 'dresses',
            price: 'KES 9,200',
            colors: [
                { hex: '#E87461', name: 'Coral', sizeStock: { 'S': 1, 'M': 1, 'L': 1 }, stock: 3 },
                { hex: '#D45341', name: 'Deep Coral', sizeStock: { 'S': 1, 'M': 1, 'L': 0 }, stock: 2 },
                { hex: '#E8DED1', name: 'Sand', sizeStock: { 'S': 1, 'M': 2, 'L': 1 }, stock: 4 }
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

        // Get the first size for initial display
        const firstSize = item.sizes && item.sizes.length > 0 ? item.sizes[0] : '';
        
        const colorsHTML = item.colors.map((color, i) => {
            const hex = getColorHex(color);
            const name = getColorName(color);
            const sizeStock = getColorSizeStock(color);
            const totalStock = getColorStock(color);
            const secondaryHex = getColorHex(item.colors[(i + 1) % item.colors.length]);
            const stockClass = getStockClass(totalStock);
            const activeClass = i === 0 ? ' active' : '';
            const ariaLabel = `${name || 'Color option ' + (i + 1)}: ${totalStock} in stock`;
            const title = `${name}: ${totalStock} in stock`;
            
            return `<button class="color-dot${activeClass} ${stockClass}" 
                style="background-color: ${hex}" 
                data-color="${hex}" 
                data-secondary-color="${secondaryHex}" 
                data-size-stock='${JSON.stringify(sizeStock)}' 
                data-color-name="${name}" 
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

        return `
            <div class="collection-card" data-item-id="${item.id}" style="transition-delay: ${index * 100}ms">
                <div class="card-image">
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
                    </div>
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
        // Show loading state
        collectionsGrid.innerHTML = '<div class="loading-state"><div class="crochet-spinner"></div></div>';
        
        try {
            const filtered = await fetchCollections(category);
            
            collectionsGrid.innerHTML = filtered.map((item, index) => 
                createCollectionCard(item, index)
            ).join('');

            // Animate cards in
            setTimeout(() => {
                document.querySelectorAll('.collection-card').forEach(card => {
                    card.classList.add('visible');
                });
            }, 100);
            
            // Initialize color and size selection
            initCardInteractions();
        } catch {
            // Fallback to static data
            const filtered = category === 'all' 
                ? collections 
                : collections.filter(item => item.category === category);
            
            collectionsGrid.innerHTML = filtered.map((item, index) => 
                createCollectionCard(item, index)
            ).join('');

            setTimeout(() => {
                document.querySelectorAll('.collection-card').forEach(card => {
                    card.classList.add('visible');
                });
            }, 100);
            
            // Initialize color and size selection
            initCardInteractions();
        }
    }

    // Initialize color switching and size selection interactions
    function initCardInteractions() {
        // Color switching functionality
        document.querySelectorAll('.collection-card').forEach(card => {
            const colorDots = card.querySelectorAll('.color-dot');
            const sizeBtns = card.querySelectorAll('.size-btn');
            const artworkSvg = card.querySelector('.card-artwork-svg');
            const stockDisplay = card.querySelector('[data-stock-display]');
            
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
                    
                    // Update SVG artwork colors with smooth transition
                    if (artworkSvg) {
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

    async function init() {
        // Initialize scroll progress
        initScrollProgress();
        
        // Initialize crochet animations
        initCrochetAnimations();
        
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
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
