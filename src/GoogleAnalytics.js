/* global gtag */
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TRACKING_ID = 'G-4EWL8M8PLF';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (!window.gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
      
      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', TRACKING_ID);
        console.log('Google Analytics script loaded successfully');
      };

      script.onerror = () => {
        console.error('Failed to load Google Analytics script');
      };

      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    }
  }, []);

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', TRACKING_ID, { page_path: location.pathname + location.search });
      console.log(`Page view recorded for: ${location.pathname + location.search}`);
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;