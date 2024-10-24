import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { fetchUserId } from '../../store/actions/userActions';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import Research from '../Research/Research';
import Invest from '../Invest/Invest';
import Monitor from '../Monitor/Monitor';
import { API_ENDPOINTS } from '../../config/api';
import { 
  FaSearch, 
  FaChartLine, 
  FaCoins, 
  FaChartBar, 
  FaWallet, 
  FaClock 
} from 'react-icons/fa';

const Rewards = () => {
  // Redux state and dispatch
  const { isAuthorized, userId, email } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Local state
  const [currentPoints, setCurrentPoints] = useState(0);
  const [lifetimePoints, setLifetimePoints] = useState(0);
  const [investmentBalance, setInvestmentBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('research');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user ID if not available
  useEffect(() => {
    if (isAuthorized && email && !userId) {
      dispatch(fetchUserId(email));
    }
  }, [isAuthorized, email, userId, dispatch]);

  // Fetch user data when userId is available
  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    } else {
      console.log('No user ID available');
    }
    setIsLoading(false);
  }, [userId]);

  // Function to fetch all user data
  const fetchUserData = async (id) => {
    try {
      const [pointsResponse, investmentResponse] = await Promise.all([
        axios.get(`${API_ENDPOINTS.USER_POINTS}/${id}`),
        axios.get(`${API_ENDPOINTS.USER_INVESTMENTS}/${id}`)
      ]);
      
      setCurrentPoints(pointsResponse.data.currentPoints);
      setLifetimePoints(pointsResponse.data.lifetimePoints);
      setInvestmentBalance(investmentResponse.data.balance);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to fetch user data');
    }
  };

  // Error handling display
  if (error) {
    return (
      <div className="rewards-container">
        <Header />
        <div className="rewards-content">
          <Navbar />
          <div className="rewards-main">
            <div className="error-message">
              <h2>Error Loading Data</h2>
              <p>{error}</p>
              <button onClick={() => fetchUserData(userId)}>Retry</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state display
  if (isLoading) {
    return (
      <div className="rewards-container">
        <Header />
        <div className="rewards-content">
          <Navbar />
          <div className="rewards-main">
            <div className="loading-spinner">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rewards-container">
      <Header />
      <div className="rewards-content">
        <Navbar />
        <div className="rewards-main">
          <section className="rewards-header">
            <h1>Catholic AI Investment Rewards</h1>
          </section>

          <section className="dashboard-metrics">
            <div className="metric-card">
              <div className="metric-icon">
                <FaCoins />
              </div>
              <div className="metric-content">
                <h3>Current Points</h3>
                <span className="metric-value">{currentPoints.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <FaClock />
              </div>
              <div className="metric-content">
                <h3>Lifetime Points</h3>
                <span className="metric-value">{lifetimePoints.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="metric-icon">
                <FaWallet />
              </div>
              <div className="metric-content">
                <h3>Investment Balance</h3>
                <span className="metric-value">${investmentBalance.toLocaleString()}</span>
              </div>
            </div>
          </section>

          <section className="rewards-description">
            <p>
              Explore Catholic AI Research and Stock Market Investing through our AI agent. 
              Convert the points you earn into Catholic aligned AI investments.
            </p>
          </section>

          <section className="rewards-cards">
            <div className="reward-card">
              <h2><FaCoins /> Earn Points</h2>
              <ul>
                <li>5 points upon account creation</li>
                <li>1 point per week for completed challenges</li>
                <li>10 points monthly for referred active users</li>
              </ul>
            </div>
            <div className="reward-card">
              <h2><FaChartLine /> Use Points</h2>
              <ul>
                <li>Convert 25+ points to investments</li>
                <li>1 point = $1 investment dollars</li>
                <li>Invest in top Catholic-aligned companies</li>
              </ul>
            </div>
          </section>

          <section className="research-invest-section">
            <div className="tab-buttons">
              <button 
                onClick={() => setActiveTab('research')} 
                className={activeTab === 'research' ? 'active' : ''}
              >
                <FaSearch /> Research
              </button>
              <button 
                onClick={() => setActiveTab('invest')} 
                className={activeTab === 'invest' ? 'active' : ''}
              >
                <FaChartLine /> Invest
              </button>
              <button 
                onClick={() => setActiveTab('monitor')} 
                className={activeTab === 'monitor' ? 'active' : ''}
              >
                <FaChartBar /> Monitor
              </button>
            </div>
            
            <div className="tab-content">
              {activeTab === 'research' && (
                <div className="tab-pane">
                  <h3>Company Research</h3>
                  <p>Analyze companies based on AI capabilities, Catholic values, and efficiency metrics.</p>
                  <Research />
                </div>
              )}
              {activeTab === 'invest' && (
                <div className="tab-pane">
                  <h3>Guided Investment</h3>
                  <p>Create an optimal portfolio aligned with Catholic values using our AI-driven process.</p>
                  <Invest />
                </div>
              )}
              {activeTab === 'monitor' && (
                <div className="tab-pane">
                  <h3>Investment Monitor</h3>
                  <p>Track the performance, holdings, and growth of your investments.</p>
                  <Monitor />
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Rewards;