'use client';

import { useEffect, useState } from 'react';

/**
 * Custom hook for media query detection that's SSR-safe
 * 
 * @param query - CSS media query string (e.g., '(max-width: 767px)')
 * @returns boolean indicating if the media query matches
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const media = window.matchMedia(query);
    
    // Set initial value
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    // Create listener for changes
    const listener = () => setMatches(media.matches);
    
    // Use addEventListener (modern approach)
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  // Return false during SSR, actual value after mount
  return mounted ? matches : false;
}

/**
 * Convenience hook for mobile detection
 * Considers mobile as screens narrower than 768px (Tailwind's 'md' breakpoint)
 */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');

/**
 * Convenience hook for tablet detection
 * Considers tablet as screens between 768px and 1023px
 */
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

/**
 * Convenience hook for desktop detection
 * Considers desktop as screens 1024px and wider
 */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
