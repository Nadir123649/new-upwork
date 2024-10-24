import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from '../../store/actions/userActions';
import './ObjectivesChat.css';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';

const ObjectivesChat = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [objectives, setObjectives] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useSelector((state) => state.user);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const handleProductionObjectives = async () => {
    try {
      setIsLoading(true);
      // const response = await axios.post('http://localhost:5053/production_objectives', { user_id: 391 });
      const response = await axios.post('https://crossvalidation.ai/production_objectives', { user_id: 391 });
      console.log('Production objectives response:', response.data);
      // Handle the response as needed
    } catch (error) {
      console.error('Error calling production objectives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const accountDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target)
      ) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      setIsLoading(true);
      // const response = await axios.get('http://localhost:5053/objectives?user_id=391');
      const response = await axios.get('https://crossvalidation.ai/objectives?user_id=391');
      setObjectives(response.data);
    } catch (error) {
      console.error('Error fetching objectives:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      try {
        setIsLoading(true);
        setMessages((prevMessages) => [...prevMessages, { role: 'user', content: inputMessage }]);
        setInputMessage('');
        // const response = await axios.post('http://localhost:5053/objectives_chat', { message: inputMessage });
        const response = await axios.post('https://crossvalidation.ai/objectives_chat', { message: inputMessage });
        setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: response.data.response }]);
        fetchObjectives();
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="objectives-chat">
      <div className="chat-content">
        <Header />

        <div className="chat-container">
          <Navbar />

          <div className="chat-main">
            <div className="objectives-section">
              <div className="objectives-section-left">
                <h2>Strategy Objectives</h2>
                <p>Target Period: {objectives.target_period} days</p>
                <p>Stock Universe: {objectives.stock_universe}</p>
                <p>Number of Stocks: {objectives.number_stocks}</p>

                <h3>Sector Allocation</h3>
                {objectives.sector_allocation && (
                  <ul>
                    <li>{objectives.sector_allocation}</li>
                  </ul>
                )}
              </div>
              <div className="objectives-section-right">
                <div className="feature-item">
                  <h3>Economic Features:</h3>
                  <ul>
                    {objectives.economic_features &&
                      objectives.economic_features.split(',').map((feature, index) => (
                        <li key={index}>{feature.trim()}</li>
                      ))}
                  </ul>
                </div>

                <div className="feature-item">
                  <h3>Financial Features:</h3>
                  <ul>
                    {objectives.financial_features &&
                      objectives.financial_features.split(',').map((feature, index) => (
                        <li key={index}>{feature.trim()}</li>
                      ))}
                  </ul>
                </div>

                <div className="feature-item">
                  <h3>Market Data Features:</h3>
                  <ul>
                    {objectives.market_data_features &&
                      objectives.market_data_features.split(',').map((feature, index) => (
                        <li key={index}>{feature.trim()}</li>
                      ))}
                  </ul>
                </div>

                <div className="feature-item">
                  <h3>Treasury Rate Features:</h3>
                  <ul>
                    {objectives.treasury_rate_features &&
                      objectives.treasury_rate_features.split(',').map((feature, index) => (
                        <li key={index}>{feature.trim()}</li>
                      ))}
                  </ul>
                </div>

                <h3>Market Cap Allocation</h3>
                {objectives.market_cap_allocation && (
                  <ul>
                    <li>{objectives.market_cap_allocation}</li>
                  </ul>
                )}

                <button className="production-objectives-button" onClick={handleProductionObjectives} disabled={isLoading}>
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    'Apply Updates To Realtime Strategy'
                  )}
                </button>
              </div>
            </div>
            <div className="chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-content">
                    {message.content.split('\n').map((line, lineIndex) => (
                      <p key={lineIndex}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="message assistant">
                  <div className="message-content">
                    <p>Loading response...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chat-input">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter new prompt ..."
                required
                disabled={isLoading}
              ></textarea>
              <button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  'Send'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObjectivesChat;