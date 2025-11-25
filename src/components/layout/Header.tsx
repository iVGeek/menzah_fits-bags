'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const navLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Collections', href: '#collections' },
  { name: 'Testimonials', href: '#testimonials' },
  { name: 'Contact', href: '#contact' },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            href="#home" 
            className="flex items-center space-x-2 group"
          >
            <div className="relative">
              <span className={`text-2xl sm:text-3xl font-serif font-bold tracking-tight transition-colors duration-300 ${
                isScrolled ? 'text-ocean' : 'text-white'
              }`}>
                Menzah
              </span>
              <span className={`text-2xl sm:text-3xl font-serif font-light tracking-tight transition-colors duration-300 ${
                isScrolled ? 'text-coral' : 'text-coral-light'
              }`}>
                _fits
              </span>
              {/* Decorative crochet stitch */}
              <svg
                className={`absolute -bottom-1 left-0 w-full h-1 transition-colors duration-300 ${
                  isScrolled ? 'text-ocean/30' : 'text-white/30'
                }`}
                viewBox="0 0 100 4"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 2 Q10 0, 20 2 T40 2 T60 2 T80 2 T100 2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </svg>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium tracking-wide transition-all duration-300 hover:opacity-70 relative group ${
                  isScrolled ? 'text-charcoal' : 'text-white'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                  isScrolled ? 'bg-ocean' : 'bg-white'
                }`} />
              </Link>
            ))}
            <Link
              href="#contact"
              className={`btn-primary text-sm ${
                isScrolled ? '' : 'bg-white/20 backdrop-blur-sm border border-white/30'
              }`}
            >
              Order Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-charcoal' : 'text-white'
            }`}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className={`rounded-2xl p-6 space-y-4 ${
            isScrolled ? 'bg-sand-light' : 'bg-white/10 backdrop-blur-md'
          }`}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-lg font-medium transition-colors ${
                  isScrolled ? 'text-charcoal hover:text-ocean' : 'text-white hover:text-coral-light'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-primary block text-center mt-4"
            >
              Order Now
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
