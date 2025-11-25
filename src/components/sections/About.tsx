'use client';

import { useEffect, useState, useRef } from 'react';

export default function About() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="py-24 sm:py-32 bg-cream relative overflow-hidden"
    >
      {/* Decorative crochet pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          {[...Array(5)].map((_, row) =>
            [...Array(5)].map((_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={20 + col * 40}
                cy={20 + row * 40}
                r="15"
                stroke="currentColor"
                strokeWidth="2"
                className="text-ocean"
              />
            ))
          )}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image/Visual Side */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            {/* Decorative frame */}
            <div className="relative">
              {/* Main image placeholder with crochet texture */}
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-sand to-sand-dark overflow-hidden shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Stylized crochet artwork */}
                  <svg viewBox="0 0 300 400" className="w-4/5 h-4/5 text-ocean/30">
                    {/* Crochet dress silhouette */}
                    <ellipse cx="150" cy="80" rx="35" ry="45" fill="currentColor" />
                    <path
                      d="M115 120 L85 400 L215 400 L185 120 Z"
                      fill="currentColor"
                    />
                    {/* Crochet pattern overlay */}
                    {[...Array(8)].map((_, row) => (
                      <g key={row}>
                        {[...Array(6)].map((_, col) => (
                          <circle
                            key={`${row}-${col}`}
                            cx={90 + col * 25}
                            cy={140 + row * 30}
                            r="8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-coral/40"
                          />
                        ))}
                      </g>
                    ))}
                  </svg>
                </div>
                {/* Decorative label */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-ocean">
                  Handcrafted Excellence
                </div>
              </div>
              {/* Floating accent elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-coral/20 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-ocean/20 rounded-full blur-xl" />
            </div>
          </div>

          {/* Content Side */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            {/* Section label */}
            <div className="inline-flex items-center gap-2 bg-ocean/10 text-ocean px-4 py-2 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              Our Story
            </div>

            <h2 className="text-4xl sm:text-5xl font-serif font-bold text-charcoal mb-6 leading-tight">
              Woven by the{' '}
              <span className="text-ocean">Coastal Breeze</span>
            </h2>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Born on the sun-kissed shores of Kenya&apos;s coast, <strong className="text-charcoal">Menzah_fits</strong> is 
              a celebration of coastal artistry and traditional craftsmanship. Each piece we create 
              carries the warmth of our heritage and the rhythm of the ocean waves.
            </p>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our artisans transform premium yarns into stunning crochet dresses and outfits, 
              blending timeless techniques with contemporary designs. Every stitch tells a story 
              of dedication, creativity, and the authentic Kenyan spirit.
            </p>

            {/* Features */}
            <div className="grid sm:grid-cols-2 gap-6 mb-10">
              {[
                { icon: '🧶', title: 'Handcrafted', desc: 'Every piece made by skilled artisans' },
                { icon: '🌊', title: 'Coastal Inspired', desc: 'Designs reflecting ocean beauty' },
                { icon: '✨', title: 'Premium Quality', desc: 'Finest materials and attention to detail' },
                { icon: '💚', title: 'Sustainable', desc: 'Eco-conscious fashion choices' },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className={`flex items-start gap-3 transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <span className="text-2xl">{feature.icon}</span>
                  <div>
                    <h3 className="font-semibold text-charcoal">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="#collections"
              className="inline-flex items-center gap-2 text-ocean font-medium hover:gap-4 transition-all duration-300"
            >
              Discover Our Collections
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
