import React, { useState } from 'react';
import axios from 'axios';

const SchwabAuth = ({ userId }) => {  // Assume userId is passed as a prop
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuthClick = async () => {
    console.log('handleAuthClick called');
    setLoading(true);
    setError(null);
    try {
      console.log('Initiating auth for user ID:', userId);
      const response = await axios.get(`https://crossvalidation.ai/initiate_auth?user_id=${userId}`);
      console.log('Initiate auth response:', response.data);
      if (response.data && response.data.auth_url) {
        console.log('Redirecting to:', response.data.auth_url);
        window.location.href = response.data.auth_url; // Change this line
      } else {
        console.error('Invalid response from initiate_auth:', response.data);
        setError('Invalid response from server');
      }
    } catch (err) {
      setError('Failed to initiate authentication. Please try again.');
      console.error('Error initiating auth:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Connect Your Schwab Account</h2>
      <button onClick={handleAuthClick} disabled={loading}>
        {loading ? 'Connecting...' : 'Connect Schwab Account'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SchwabAuth;