import { setSchwabAuthentication } from '../store/actions/userActions';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';

const SchwabCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const handleCallback = async () => {
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const userId = searchParams.get('state'); // The user_id is passed as the 'state' parameter

      if (!code || !userId) {
        setStatus('Error: Missing authentication data');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5052/callbacks`, {
          params: { code, user_id: userId }
        });

        if (response.data.auth_status === 'success') {
          dispatch(setSchwabAuthentication(true));
          setStatus('Authentication successful. Redirecting...');
          setTimeout(() => {
            navigate('/invest', { 
              state: { 
                showSuccessPopup: true,
                message: 'Schwab account connected successfully!'
              }
            });
          }, 2000);
        } else {
          setStatus('Authentication failed. Please try again or contact our support for help, Adrian@CrossValidation.ai.');
          setTimeout(() => {
            navigate('/invest', { 
              state: { 
                showErrorPopup: true,
                message: 'Failed to connect Schwab account. Please try again or contact our support for help, Adrian@CrossValidation.ai.'
              }
            });
          }, 2000);
        }
      } catch (error) {
        console.error('Error during callback processing:', error);
        setStatus('An error occurred. Please try again.');
        setTimeout(() => {
          navigate('/invest', { 
            state: { 
              showErrorPopup: true,
              message: 'An error occurred while connecting your Schwab account. Please try again or contact our support for help, Adrian@CrossValidation.ai.'
            }
          });
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate, location, dispatch]);

  return (
    <div className="schwab-callback">
      <h2>Schwab Authentication</h2>
      <p>{status}</p>
    </div>
  );
};

export default SchwabCallback;