import { useEffect } from 'react';

export const usePageReloadOnBack = () => {
  useEffect(() => {
    // Only apply this hook on non-mobile browsers
    if (isMobileBrowser()) {
      return;
    }

    let lastActionTime = Date.now();

    const handleVisibilityChange = () => {
      // Check if page becomes visible and enough time has passed (indicating actual navigation)
      if (document.visibilityState === 'visible') {
        const currentTime = Date.now();
        if (currentTime - lastActionTime > 100) { // Threshold to avoid double reloads
          window.location.reload();
        }
      }
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    const handlePopState = () => {
      lastActionTime = Date.now();
      // Use setTimeout to ensure this runs after the browser's own handling
      setTimeout(() => {
        window.location.reload();
      }, 0);
    };

    // Track page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Handle bfcache restoration
    window.addEventListener('pageshow', handlePageShow);
    // Handle back/forward navigation
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
};

// Helper to detect mobile browsers
export const isMobileBrowser = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};