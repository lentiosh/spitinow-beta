import { useEffect } from 'react';

export const usePageReloadOnBack = () => {
  useEffect(() => {
    const handlePageShow = (event) => {

      const isFromBFCache = event.persisted;

      const navigationEntries = window.performance.getEntriesByType('navigation');
      const isBackForward =
        navigationEntries.length > 0
          ? navigationEntries[0].type === 'back_forward'
          : false;

      if (isFromBFCache || isBackForward) {
        window.location.reload(); 
      }
    };

    const handlePopState = () => {
      window.location.reload(); 
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
};