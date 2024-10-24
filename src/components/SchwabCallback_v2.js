import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SchwabCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authStatus = searchParams.get('auth_status');
    const userId = searchParams.get('user_id');

    if (authStatus === 'success') {
      // Store the user ID if needed
      localStorage.setItem('userId', userId);
      
      // Navigate to the chat page
      navigate('/chat', { 
        state: { 
          showSuccessPopup: true,
          message: 'Schwab account connected successfully!'
        }
      });
    } else {
      // Handle error case
      navigate('/chat', { 
        state: { 
          showErrorPopup: true,
          message: 'Failed to connect Schwab account. Please try again.'
        }
      });
    }
  }, [navigate, location]);

  return <div>Completing authentication...</div>;
};

export default SchwabCallback;