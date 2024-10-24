import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import './FaithBanner.css';

const FaithBanner = ({ userId, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async (neverShowAgain = false) => {
    console.log(`Closing banner for user ${userId}, neverShowAgain: ${neverShowAgain}`);
    setIsClosing(true);
    try {
      console.log(`Sending POST request to: ${API_ENDPOINTS.UPDATE_FAITH_BANNER_PREFERENCE}`);
      console.log('Request payload:', { userId, neverShowAgain });
      const response = await axios.post(API_ENDPOINTS.UPDATE_FAITH_BANNER_PREFERENCE, { userId, neverShowAgain });
      console.log('Response:', response);
      console.log('Response data:', response.data);
    } catch (error) {
      console.error('Error updating banner preference:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
    } finally {
      console.log('Calling onClose callback');
      setTimeout(() => {
        onClose(neverShowAgain);
      }, 300);
    }
  };

  return (
    <div className={`faith-banner ${isClosing ? 'closing' : ''}`}>
      <div className="faith-banner-content">
        <div className="faith-banner-text">
          <h2>Welcome to Your Faith Journey</h2>
          <p>
            Set and track personalized faith challenges, reflect on your spiritual journey, and earn points for your progress.  
          </p>
          <p>
            Information here is integrated into the Spiritual Direction chat; redeem Catholic aligned investment rewards for your dedication. 
          </p>
        </div>
        <div className="faith-banner-actions">
          <button onClick={(e) => { e.stopPropagation(); handleClose(false); }} className="faith-banner-button">
            Got it
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleClose(true); }} className="faith-banner-link">
            Don't show again
          </button>
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); handleClose(false); }} className="faith-banner-close" aria-label="Close">
        &times;
      </button>
    </div>
  );
};

export default FaithBanner;