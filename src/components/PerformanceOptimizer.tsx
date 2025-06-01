'use client';

import { useEffect } from 'react';

export function PerformanceOptimizer() {
  useEffect(() => {
    // Optimize images for mobile
    const optimizeImages = () => {
      const images = document.querySelectorAll('img[loading="lazy"]');
      images.forEach((img) => {
        if (img instanceof HTMLImageElement) {
          img.addEventListener('load', () => {
            img.classList.add('loaded');
          });
        }
      });
    };

    // Reduce motion for users who prefer it
    const reduceMotion = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      
      if (prefersReducedMotion.matches) {
        document.documentElement.style.setProperty('--animation-duration', '0.01ms');
        document.documentElement.style.setProperty('--transition-duration', '0.01ms');
      }
    };

    // Optimize scrolling performance
    const optimizeScrolling = () => {
      let ticking = false;
      
      const updateScrollPosition = () => {
        // Throttle scroll events for better performance
        ticking = false;
      };
      
      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(updateScrollPosition);
          ticking = true;
        }
      };
      
      window.addEventListener('scroll', onScroll, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', onScroll);
      };
    };

    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
      fontLink.as = 'style';
      fontLink.crossOrigin = 'anonymous';
      document.head.appendChild(fontLink);
    };

    // Mobile-specific optimizations
    const mobileOptimizations = () => {
      const isMobile = window.innerWidth <= 768;
      
      if (isMobile) {
        // Reduce animation complexity on mobile
        document.documentElement.classList.add('mobile-optimized');
        
        // Optimize touch events
        document.addEventListener('touchstart', () => {}, { passive: true });
        document.addEventListener('touchmove', () => {}, { passive: true });
        
        // Prevent zoom on input focus
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
        }
      }
    };

    // Initialize optimizations
    optimizeImages();
    reduceMotion();
    const cleanupScroll = optimizeScrolling();
    preloadCriticalResources();
    mobileOptimizations();

    // Cleanup
    return () => {
      if (cleanupScroll) cleanupScroll();
    };
  }, []);

  return null; // This component doesn't render anything
}

export default PerformanceOptimizer; 