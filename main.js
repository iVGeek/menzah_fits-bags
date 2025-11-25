/**
 * Menzah_fits - Main JavaScript
 * Handcrafted Coastal Crochet Fashion
 * Pure Vanilla JavaScript - Zero Dependencies
 */

(function() {
    'use strict';

    // =================================
    // Data
    // =================================

    const collections = [
        {
            id: 1,
            name: 'Ocean Breeze Maxi',
            category: 'dresses',
            price: 'KES 8,500',
            colors: ['#2A7B9B', '#E8DED1', '#E87461'],
            description: 'Flowing maxi dress with intricate wave patterns',
            badge: 'bestseller',
        },
        {
            id: 2,
            name: 'Coral Sunset Top',
            category: 'tops',
            price: 'KES 4,200',
            colors: ['#E87461', '#F09B8D', '#C9BBA8'],
            description: 'Lightweight crochet top perfect for warm evenings',
            badge: null,
        },
        {
            id: 3,
            name: 'Sandy Shores Dress',
            category: 'dresses',
            price: 'KES 7,800',
            colors: ['#E8DED1', '#8B7355', '#FDF8F3'],
            description: 'Elegant beach dress with natural fiber texture',
            badge: 'new',
        },
        {
            id: 4,
            name: 'Coastal Elegance Set',
            category: 'sets',
            price: 'KES 12,500',
            colors: ['#2A7B9B', '#1E5A73', '#E8DED1'],
            description: 'Two-piece ensemble for special occasions',
            badge: 'limited',
        },
        {
            id: 5,
            name: 'Tidal Wave Skirt',
            category: 'skirts',
            price: 'KES 5,500',
            colors: ['#4FA3C7', '#2A7B9B', '#FDF8F3'],
            description: 'Flowing midi skirt with wave-inspired patterns',
            badge: null,
        },
        {
            id: 6,
            name: 'Reef Romance Dress',
            category: 'dresses',
            price: 'KES 9,200',
            colors: ['#E87461', '#D45341', '#E8DED1'],
            description: 'Romantic crochet dress with coral accents',
            badge: 'featured',
        },
    ];

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

        const colorsHTML = item.colors.map((color, i) => 
            `<button class="color-dot" style="background-color: ${color}" aria-label="Color option ${i + 1}"></button>`
        ).join('');

        return `
            <div class="collection-card" style="transition-delay: ${index * 100}ms">
                <div class="card-image">
                    <div class="card-artwork">
                        <svg viewBox="0 0 200 280">
                            <ellipse cx="100" cy="50" rx="25" ry="30" fill="${item.colors[0]}" opacity="0.6"/>
                            <path d="M75 75 L55 280 L145 280 L125 75 Z" fill="${item.colors[0]}" opacity="0.4"/>
                            ${[...Array(6)].map((_, row) => 
                                [...Array(4)].map((_, col) => 
                                    `<circle cx="${65 + col * 25}" cy="${95 + row * 28}" r="8" fill="none" stroke="${item.colors[1]}" stroke-width="2" opacity="0.5"/>`
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
                    <div class="card-colors">
                        <span class="colors-label">Colors:</span>
                        ${colorsHTML}
                    </div>
                </div>
            </div>
        `;
    }

    function renderCollections(category = 'all') {
        const filtered = category === 'all' 
            ? collections 
            : collections.filter(item => item.category === category);
        
        collectionsGrid.innerHTML = filtered.map((item, index) => 
            createCollectionCard(item, index)
        ).join('');

        // Animate cards in
        setTimeout(() => {
            document.querySelectorAll('.collection-card').forEach(card => {
                card.classList.add('visible');
            });
        }, 100);
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
    // Initialize
    // =================================

    function init() {
        renderCollections();
        initCategoryFilter();
        renderTestimonials();
        startTestimonialAutoplay();
        initTestimonialHover();
        initScrollAnimations();
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
