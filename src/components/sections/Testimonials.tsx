'use client';

import { useEffect, useState, useRef } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Amina K.',
    location: 'Nairobi, Kenya',
    rating: 5,
    text: 'The Ocean Breeze Maxi dress exceeded all my expectations! The craftsmanship is impeccable, and I receive compliments every time I wear it. Truly a work of art.',
    highlight: 'impeccable craftsmanship',
  },
  {
    id: 2,
    name: 'Sarah M.',
    location: 'Mombasa, Kenya',
    rating: 5,
    text: 'As someone who appreciates authentic Kenyan fashion, Menzah_fits delivers beyond imagination. My custom piece was delivered perfectly, matching every detail I requested.',
    highlight: 'authentic Kenyan fashion',
  },
  {
    id: 3,
    name: 'Grace O.',
    location: 'Kisumu, Kenya',
    rating: 5,
    text: 'I ordered a complete set for my beach wedding and it was absolutely stunning. The attention to detail and the quality of the crochet work is second to none.',
    highlight: 'absolutely stunning',
  },
  {
    id: 4,
    name: 'Diana W.',
    location: 'Malindi, Kenya',
    rating: 5,
    text: 'The comfort and elegance of my Menzah dress is unmatched. It breathes beautifully in our coastal climate while looking incredibly chic. Worth every shilling!',
    highlight: 'comfort and elegance',
  },
];

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
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

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="py-24 sm:py-32 bg-ocean relative overflow-hidden"
    >
      {/* Decorative wave patterns */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M0 50 Q25 30, 50 50 T100 50 V100 H0 Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Crochet pattern decoration */}
      <div className="absolute top-0 left-0 w-48 h-48 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {[...Array(4)].map((_, row) =>
            [...Array(4)].map((_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={12.5 + col * 25}
                cy={12.5 + row * 25}
                r="10"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
            ))
          )}
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Customer Love
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-white mb-4">
            What Our <span className="text-coral-light">Clients</span> Say
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Stories from women who have experienced the magic of our handcrafted coastal fashion.
          </p>
        </div>

        {/* Testimonials Display */}
        <div className="max-w-4xl mx-auto">
          {/* Featured Testimonial */}
          <div
            className={`bg-white rounded-3xl p-8 sm:p-12 shadow-2xl transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {/* Quote icon */}
            <div className="text-ocean/20 mb-6">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            {/* Testimonial content */}
            <div className="relative min-h-[160px]">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`transition-all duration-500 absolute inset-0 ${
                    index === activeIndex
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-10 pointer-events-none'
                  }`}
                >
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ocean to-ocean-light flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-charcoal">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'bg-ocean w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`View testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Stats */}
          <div
            className={`grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            {[
              { value: '500+', label: 'Happy Clients' },
              { value: '100%', label: 'Handcrafted' },
              { value: '4.9', label: 'Rating' },
              { value: '200+', label: 'Designs' },
            ].map((stat) => (
              <div key={stat.label} className="text-center text-white">
                <div className="text-3xl sm:text-4xl font-bold text-coral-light mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
