import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const useForceRerender = () => {
  const [key, setKey] = useState(0);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathRef = useRef(pathname);
  const lastSearchRef = useRef(searchParams.toString());
  const navigationTimestampRef = useRef(Date.now());
  const backNavigationRef = useRef(false);
  
  // Improved back navigation detection
  const isBackNavigation = useCallback(() => {
    const currentTimestamp = Date.now();
    const timeDiff = currentTimestamp - navigationTimestampRef.current;
    // Increased threshold and added backNavigation flag check
    return timeDiff > 100 || backNavigationRef.current;
  }, []);

  // Enhanced route change detection
  const hasRouteChanged = useCallback(() => {
    const currentSearch = searchParams.toString();
    const pathChanged = pathname !== lastPathRef.current;
    const searchChanged = currentSearch !== lastSearchRef.current;
    
    // Update refs immediately when change is detected
    if (pathChanged || searchChanged) {
      lastPathRef.current = pathname;
      lastSearchRef.current = currentSearch;
      navigationTimestampRef.current = Date.now();
    }
    
    return pathChanged || searchChanged;
  }, [pathname, searchParams]);

  // Handle all navigation events in a single effect
  useEffect(() => {
    const handleNavigation = (isBack = false) => {
      backNavigationRef.current = isBack;
      if (isBackNavigation()) {
        setKey(prev => prev + 1);
        // Reset back navigation flag after handling
        backNavigationRef.current = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleNavigation(true);
      }
    };

    const handlePopState = () => {
      handleNavigation(true);
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        handleNavigation(true);
      }
    };

    // Register all event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);

    // Cleanup function
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [isBackNavigation]);

  // Handle forward navigation and regular route changes
  useEffect(() => {
    if (hasRouteChanged()) {
      navigationTimestampRef.current = Date.now();
      // Reset back navigation flag on forward navigation
      backNavigationRef.current = false;
    }
  }, [hasRouteChanged, pathname, searchParams]);

  // Force rerender on client-side route changes
  useEffect(() => {
    const currentSearch = searchParams.toString();
    if (
      pathname !== lastPathRef.current ||
      currentSearch !== lastSearchRef.current
    ) {
      setKey(prev => prev + 1);
    }
  }, [pathname, searchParams]);

  return key;
};