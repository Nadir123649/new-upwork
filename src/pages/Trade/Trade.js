import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from '../../store/actions/userActions';
import './Trade.css';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';

const Trade = () => {
  const [tradeInput, setTradeInput] = useState('');
  const [tradeMessages, setTradeMessages] = useState([]);
  const [tradeHoldings, setTradeHoldings] = useState([]);
  const tradeMessagesEndRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useSelector((state) => state.user);
  const [isTradeDropdownOpen, setIsTradeDropdownOpen] = useState(false);

  const toggleTradeDropdown = () => {
    setIsTradeDropdownOpen(!isTradeDropdownOpen);
  };

  const scrollToBottomTrade = () => {
    tradeMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottomTrade, [tradeMessages]);

  const tradeDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        tradeDropdownRef.current &&
        !tradeDropdownRef.current.contains(event.target)
      ) {
        setIsTradeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchTradeHoldings();
  }, []);

  const fetchTradeHoldings = async () => {
    try {
      const response = await axios.get('http://localhost:5052/get_holdings');
      setTradeHoldings(response.data);
    } catch (error) {
      console.error('Error fetching trade holdings:', error);
    }
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    if (tradeInput.trim() !== '') {
      try {
        const response = await axios.post('http://localhost:5052/trade_execution_chat', { message: tradeInput });
        setTradeMessages((prevMessages) => [...prevMessages, { role: 'user', content: tradeInput }, { role: 'assistant', content: response.data.response }]);
        setTradeInput('');
      } catch (error) {
        console.error('Error sending trade message:', error);
      }
    }
  };

  const handleTradeKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTradeSubmit(e);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="trade-page">
      <div className="trade-content">
        <Header />

        <div className="trade-container">
          <Navbar />

          <div className="trade-main">
            <div className="trade-holdings-section">
              <h2>Current Holdings</h2>
              <div className="trade-holdings-list">
                {tradeHoldings.map((holding, index) => (
                  <div key={index} className="trade-holding-item">
                    <div className="trade-holding-symbol">{holding.symbol}</div>
                    <div className="trade-holding-details">
                      <p>Shares: {holding.shares}</p>
                      <p>Total Value: {holding.total_value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="trade-messages">
              {tradeMessages.map((message, index) => (
                <div key={index} className={`trade-message ${message.role}`}>
                  <div className="trade-message-content">
                    {message.content.split('\n').map((line, lineIndex) => (
                      <p key={lineIndex}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={tradeMessagesEndRef} />
            </div>

            <form onSubmit={handleTradeSubmit} className="trade-input">
              <textarea
                value={tradeInput}
                onChange={(e) => setTradeInput(e.target.value)}
                onKeyPress={handleTradeKeyPress}
                placeholder="Enter trade prompt ..."
                required
              ></textarea>
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;