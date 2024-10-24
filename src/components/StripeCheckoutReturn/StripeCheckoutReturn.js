import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserSubscription } from '../../store/actions/userActions';
import { API_ENDPOINTS } from '../../config/api';

const StripeCheckoutReturn = () => {
  const [status, setStatus] = useState('loading');
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userId } = useSelector((state) => state.user);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('session_id');

    const verifySession = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.GET_SUBSCRIPTION}?user_id=${userId}`);
        const data = await response.json();
        if (data.subscription) {
          setStatus('success');
          dispatch(updateUserSubscription(userId, data.subscription));
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error('Error verifying session:', error);
        setStatus('error');
      }
    };

    if (sessionId && userId) {
      verifySession();
    } else {
      setStatus('error');
    }
  }, [location, dispatch, userId]);

  if (status === 'loading') {
    return <div>Processing your payment...</div>;
  }

  if (status === 'success') {
    return (
      <div>
        <h2>Payment Successful!</h2>
        <p>Your account has been upgraded to Premium.</p>
        <button onClick={() => navigate('/profile')}>Go to Profile</button>
      </div>
    );
  }

  if (status === 'failed' || status === 'error') {
    return (
      <div>
        <h2>Payment Failed</h2>
        <p>There was an issue processing your payment. Please try again.</p>
        <button onClick={() => navigate('/upgrade-to-premium')}>Try Again</button>
      </div>
    );
  }
};

export default StripeCheckoutReturn;