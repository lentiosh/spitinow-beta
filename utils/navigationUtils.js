import { useEffect } from 'react';

export const isMobileBrowser = () => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
};

export const usePageReloadOnBack = () => {
  useEffect(() => {
    // Safety check for browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // Remove the mobile check to allow functionality on mobile
    let lastActionTime = Date.now();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const currentTime = Date.now();
        if (currentTime - lastActionTime > 100) {
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
      setTimeout(() => {
        window.location.reload();
      }, 0);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
};