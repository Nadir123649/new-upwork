import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import './Navbar.css';
import { setAuthStatus } from '../../store/actions/authActions';
import { checkSchwabAuthStatus } from '../../store/actions/userActions';

const Navbar = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [schwabConnected, setSchwabConnected] = useState(false);
  const { schwabAuthorized } = useSelector(state => state.auth);
  const { userId, isAuthorized } = useSelector(state => state.user);
  const navigate = useNavigate();
  const [accountInfo, setAccountInfo] = useState(null);
  const dispatch = useDispatch();
  const [subscription, setSubscription] = useState(null);


  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  useEffect(() => {
    checkSchwabConnection();
    checkSubscription();
  }, [userId]);

  const checkAuthStatus = async (userId) => {
    try {
      const response = await axios.get(`https://crossvalidation.ai/get_user_auth_status`, {
        params: { user_id: userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return { is_authenticated: false, account_info: null };
    }
  };

  useEffect(() => {
    const fetchAuthStatus = async () => {
      const { is_authenticated, account_info } = await checkAuthStatus(userId);
      dispatch(setAuthStatus(is_authenticated, account_info));
    };
    fetchAuthStatus();
  }, [dispatch, userId]);

  const checkSchwabConnection = async () => {
    try {
      const response = await axios.get(`https://crossvalidation.ai/check_schwab_connection`, {
        params: { user_id: userId }
      });
      setSchwabConnected(response.data.connected);
    } catch (error) {
      console.error('Error checking Schwab connection:', error);
    }
  };

  const checkSubscription = async () => {
    try {
      const response = await axios.get(`https://crossvalidation.ai/subscription`, {
        params: { user_id: userId }
      });
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleConnectSchwab = async () => {
    try {
      const response = await axios.get(`https://crossvalidation.ai/initiate_auth`, {
        params: { user_id: userId },
        withCredentials: true
      });
      if (response.data && response.data.auth_url) {
        window.location.href = response.data.auth_url;
      } else {
        console.error('Invalid response from initiate_auth:', response.data);
      }
    } catch (error) {
      console.error('Error initiating Schwab auth:', error);
    }
  };

  const canAccessInvestingAgent = isAuthorized && subscription === 'realtime-trading';


   return (
      <>
        <button className={`navbar-toggle ${isNavbarOpen ? 'open' : ''}`} onClick={toggleNavbar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`chat-navbar ${isNavbarOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/chat" onClick={toggleNavbar}>Catholic AI Efficiency Index</Link></li>
            <li>
              <Link 
                to="/invest" 
                className={canAccessInvestingAgent ? '' : 'disabled-link'}
                title={canAccessInvestingAgent ? '' : 'Need realtime subscription'}
                onClick={toggleNavbar}
              >
                Investing Agent
              </Link>
            </li>
            <li><Link to="/authenticate" onClick={toggleNavbar}>Authenticate</Link></li>
            <li><Link to="/about" onClick={toggleNavbar}>About</Link></li>
            <li><Link to="/methodology" onClick={toggleNavbar}>Methodology</Link></li>
          </ul>
        </nav>
        <div className="navbar-overlay" onClick={toggleNavbar}></div>
      </>
    );
};

export default Navbar;

