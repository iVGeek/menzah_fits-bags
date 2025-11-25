'use client';

import { useEffect, useState, useRef } from 'react';

const collections = [
  {
    id: 1,
    name: 'Ocean Breeze Maxi',
    category: 'Dresses',
    price: 'KES 8,500',
    colors: ['#2A7B9B', '#E8DED1', '#E87461'],
    description: 'Flowing maxi dress with intricate wave patterns',
    badge: 'Bestseller',
  },
  {
    id: 2,
    name: 'Coral Sunset Top',
    category: 'Tops',
    price: 'KES 4,200',
    colors: ['#E87461', '#F09B8D', '#C9BBA8'],
    description: 'Lightweight crochet top perfect for warm evenings',
    badge: null,
  },
  {
    id: 3,
    name: 'Sandy Shores Dress',
    category: 'Dresses',
    price: 'KES 7,800',
    colors: ['#E8DED1', '#8B7355', '#FDF8F3'],
    description: 'Elegant beach dress with natural fiber texture',
    badge: 'New',
  },
  {
    id: 4,
    name: 'Coastal Elegance Set',
    category: 'Sets',
    price: 'KES 12,500',
    colors: ['#2A7B9B', '#1E5A73', '#E8DED1'],
    description: 'Two-piece ensemble for special occasions',
    badge: 'Limited',
  },
  {
    id: 5,
    name: 'Tidal Wave Skirt',
    category: 'Skirts',
    price: 'KES 5,500',
    colors: ['#4FA3C7', '#2A7B9B', '#FDF8F3'],
    description: 'Flowing midi skirt with wave-inspired patterns',
    badge: null,
  },
  {
    id: 6,
    name: 'Reef Romance Dress',
    category: 'Dresses',
    price: 'KES 9,200',
    colors: ['#E87461', '#D45341', '#E8DED1'],
    description: 'Romantic crochet dress with coral accents',
    badge: 'Featured',
  },
];

const categories = ['All', 'Dresses', 'Tops', 'Skirts', 'Sets'];

export default function Collections() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const filteredCollections = activeCategory === 'All'
    ? collections
    : collections.filter((item) => item.category === activeCategory);

  return (
    <section
      id="collections"
      ref={sectionRef}
      className="py-24 sm:py-32 bg-gradient-to-b from-cream to-sand-light relative"
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 crochet-pattern opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-coral/10 text-coral-dark px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Our Collections
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-charcoal mb-4">
            Curated <span className="text-ocean">Coastal</span> Fashion
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our handcrafted collection of crochet pieces, each designed to 
            capture the essence of Kenyan coastal beauty.
          </p>
        </div>

        {/* Category Filter */}
        <div
          className={`flex flex-wrap justify-center gap-3 mb-12 transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-ocean text-white shadow-lg shadow-ocean/30'
                  : 'bg-white text-gray-600 hover:bg-sand hover:text-charcoal'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Collections Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCollections.map((item, index) => (
            <div
              key={item.id}
              className={`group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              {/* Image placeholder with crochet texture */}
              <div className="relative aspect-[3/4] bg-gradient-to-br from-sand-light to-sand overflow-hidden">
                {/* Stylized crochet pattern */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 200 280" className="w-3/4 h-3/4">
                    {/* Dress/item silhouette */}
                    <ellipse cx="100" cy="50" rx="25" ry="30" fill={item.colors[0]} opacity="0.6" />
                    <path
                      d="M75 75 L55 280 L145 280 L125 75 Z"
                      fill={item.colors[0]}
                      opacity="0.4"
                    />
                    {/* Crochet stitch pattern */}
                    {[...Array(6)].map((_, row) => (
                      <g key={row}>
                        {[...Array(4)].map((_, col) => (
                          <circle
                            key={`${row}-${col}`}
                            cx={65 + col * 25}
                            cy={95 + row * 28}
                            r="8"
                            fill="none"
                            stroke={item.colors[1]}
                            strokeWidth="2"
                            className="opacity-50"
                          />
                        ))}
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Badge */}
                {item.badge && (
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                    item.badge === 'Bestseller' ? 'bg-ocean text-white' :
                    item.badge === 'New' ? 'bg-coral text-white' :
                    item.badge === 'Limited' ? 'bg-charcoal text-white' :
                    'bg-natural text-white'
                  }`}>
                    {item.badge}
                  </div>
                )}

                {/* Quick actions overlay */}
                <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button 
                    className="bg-white text-charcoal px-6 py-3 rounded-full font-medium transform scale-90 group-hover:scale-100 transition-all duration-300 hover:bg-ocean hover:text-white"
                    aria-label={`View ${item.name} details`}
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-xs font-medium text-ocean uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-semibold text-charcoal mt-1">
                      {item.name}
                    </h3>
                  </div>
                  <span className="text-lg font-bold text-coral">
                    {item.price}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  {item.description}
                </p>
                {/* Color options */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Colors:</span>
                  {item.colors.map((color, colorIndex) => (
                    <button
                      key={colorIndex}
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                      aria-label={`Color option ${colorIndex + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All CTA */}
        <div
          className={`text-center mt-16 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <a
            href="#contact"
            className="btn-primary inline-flex items-center gap-2 text-lg"
          >
            Order Custom Design
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
