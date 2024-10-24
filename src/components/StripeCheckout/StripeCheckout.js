import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { API_ENDPOINTS } from '../../config/api';

const stripePromise = loadStripe('pk_test_51OoY4hIY48BI77g2Pjeo4uFdAxeh4Op7MTsN8vGgAx2napzz89VwmcntznWmq1ZLI0t67pdRhDE1SpzTGajyCaD200OVIg5oJL');

const StripeCheckout = () => {
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userId } = useSelector((state) => state.user);

  useEffect(() => {
    const createCheckoutSession = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_ENDPOINTS.CREATE_CHECKOUT_SESSION, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: userId,
            priceId: 'price_1OofPyIY48BI77g2tEAlKzto',
            returnUrl: `${window.location.origin}/checkout/return`
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      createCheckoutSession();
    }
  }, [userId]);

  if (isLoading) {
    return <div>Loading checkout...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Upgrade to Premium Account</h2>
      <p>Monthly subscription: $20</p>
      {clientSecret && (
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      )}
    </div>
  );
};

export default StripeCheckout;