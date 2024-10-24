import React, { useState } from 'react';
import axios from 'axios';

const PlaceOrder = ({ userId, accountNumber }) => {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState('MARKET');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const order = {
      orderType: orderType,
      session: "NORMAL",
      duration: "DAY",
      orderStrategyType: "SINGLE",
      orderLegCollection: [
        {
          instruction: "BUY",
          quantity: quantity,
          instrument: {
            symbol: symbol,
            assetType: "EQUITY"
          }
        }
      ]
    };

    try {
      const response = await axios.post('http://localhost:5011/place_order', 
        { account_number: accountNumber, order: order },
        { headers: { 'User-ID': userId } }
      );

      if (response.data.status_code === 201) {
        setSuccessMessage(`Order placed successfully. Order ID: ${response.data.results.order.orderId}`);
      } else {
        setError(`Failed to place order: ${response.data.results_content}`);
      }
    } catch (err) {
      setError('Error placing order. Please try again.');
      console.error('Error placing order:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Place Order</h2>
      <form onSubmit={handlePlaceOrder}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Symbol (e.g., AAPL)"
          required
        />
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value))}
          min="1"
          required
        />
        <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
          <option value="MARKET">Market</option>
          <option value="LIMIT">Limit</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
};

export default PlaceOrder;