'use client';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient representing coastal sunrise */}
      <div className="absolute inset-0 bg-gradient-to-br from-ocean-dark via-ocean to-ocean-light" />
      
      {/* Animated crochet pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="crochet-stitch" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
              <circle cx="0" cy="0" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
              <circle cx="10" cy="0" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
              <circle cx="0" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
              <circle cx="10" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#crochet-stitch)" className="animate-crochet-wave" />
        </svg>
      </div>

      {/* Sand-colored wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="#FDF8F3"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Decorative yarn thread animation */}
        <div className="mb-8 animate-fade-in">
          <svg className="w-24 h-24 mx-auto text-coral-light hero-yarn-animation" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="hero-circle-1"
            />
            <circle
              cx="50"
              cy="50"
              r="25"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="hero-circle-2"
            />
            <circle
              cx="50"
              cy="50"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="hero-circle-3"
            />
          </svg>
        </div>

        {/* Brand Name */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-4 animate-fade-in-up">
          Menzah<span className="text-coral">_fits</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl md:text-3xl text-sand-light font-light tracking-wide mb-6 animate-fade-in-up animation-delay-200">
          Coastal Elegance, Handcrafted With Love
        </p>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up animation-delay-300">
          Premium crochet dresses and outfits inspired by the beauty of Kenya&apos;s coast. 
          Each piece is a unique work of art, woven with passion and authenticity.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-500">
          <a
            href="#collections"
            className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center gap-2 group"
          >
            Explore Collections
            <svg
              className="w-5 h-5 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="#contact"
            className="btn-secondary text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-ocean inline-flex items-center justify-center"
          >
            Order Custom Piece
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 animate-fade-in animation-delay-700">
          <div className="flex flex-col items-center text-white/60">
            <span className="text-sm mb-2">Scroll to discover</span>
            <svg
              className="w-6 h-6 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
