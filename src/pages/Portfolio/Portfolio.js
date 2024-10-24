import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout } from '../../store/actions/userActions';
import './Portfolio.css';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';

const Portfolio = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [balance, setBalance] = useState(null);
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useSelector((state) => state.user);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
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
    fetchPortfolio();
    fetchBalance();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`http://localhost:5052/portfolio?user_id=${userId}`);
      setPortfolio(response.data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const fetchBalance = async () => {
    try {
      const response = await axios.get(`http://localhost:5049/api/daily_balance/${userId}`);
      if (response.data.length > 0) {
        const latestBalance = response.data[0];
        setBalance(latestBalance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() !== '') {
      try {
        const response = await axios.post('http://localhost:5049/realtime_portfolio_apis_handler', {
          user_input: inputMessage,
          user_id: userId,
        });
        const assistantResponse = response.data.explanation;
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'user', content: inputMessage },
          { role: 'assistant', content: assistantResponse },
        ]);
        setInputMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
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
    <div className="portfolio">
      <div className="chat-content">
        <Header />

        <div className="chat-container">
          <Navbar />

          <div className="chat-main">
            <div className="portfolio-section">
              <h2>Portfolio Holdings</h2>
              {balance && (
                <div className="balance">
                  <p>Date: {balance.date}</p>
                  <p>Balance: {balance.total_value}</p>
                </div>
              )}
              <div className="stock-list">
                {portfolio.map((stock, index) => (
                  <div key={index} className="stock-item">
                    <div className="stock-symbol">{stock.symbol}</div>
                    <div className="stock-details">
                      <p>Date Purchased: {stock.date_purchased}</p>
                      <p>Percent of Portfolio: {stock.percent_of_portfolio}%</p>
                      <p>Profit/Loss: {stock.profit_loss}</p>
                    </div>
                  </div>
                ))}
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
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chat-input">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter new prompt ..."
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

export default Portfolio;