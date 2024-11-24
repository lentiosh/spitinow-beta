// src/hooks/useForceRerenderOnNavigation.js

import { useEffect, useState } from 'react';

const useForceRerenderOnNavigation = () => {
  const [renderTrigger, setRenderTrigger] = useState(0);

  useEffect(() => {
    const handleRouteChange = () => {
      console.log('Navigation event detected. Forcing re-render.');
      setRenderTrigger((prev) => prev + 1);
    };

    // Listen to popstate event (Back/Forward buttons)
    window.addEventListener('popstate', handleRouteChange);

    // Monkey-patch pushState and replaceState to detect programmatic navigation
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      handleRouteChange();
    };

    window.history.replaceState = function (...args) {
      originalReplaceState.apply(window.history, args);
      handleRouteChange();
    };

    // Listen to pageshow event for BFCache navigation
    const handlePageShow = (event) => {
      if (event.persisted) {
        console.log('Page loaded from BFCache. Forcing re-render.');
        handleRouteChange();
      }
    };
    window.addEventListener('pageshow', handlePageShow);

    // Cleanup function to remove event listeners and restore original methods
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  return renderTrigger;
};

export default useForceRerenderOnNavigation;