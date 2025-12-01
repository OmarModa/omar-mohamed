import { useEffect } from 'react';

export const HTTPSRedirect = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLocalhost = window.location.hostname === 'localhost' ||
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname === '';

      if (!isLocalhost && window.location.protocol !== 'https:') {
        window.location.href = window.location.href.replace('http:', 'https:');
      }
    }
  }, []);

  return null;
};
