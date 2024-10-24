import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaCompass, FaChartBar, FaCross, FaChartLine } from 'react-icons/fa';
import './Navbar.css';
import SignupPopup from '../SignupPopup/SignupPopup';

const Navbar = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const { userId, tempUserId, subscription } = useSelector(state => state.user);
  const navigate = useNavigate();

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const handleInvestingAgentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const effectiveUserId = userId || tempUserId;
    if (effectiveUserId && effectiveUserId > 4000) {
      if (subscription !== 'realtime-trading') {
        setShowSignupPopup(true);
      } else {
        navigate('/invest');
      }
    } else {
      navigate('/invest');
    }
  };

  useEffect(() => {
    console.log('Navbar component mounted or updated');
    console.log('Current userId:', userId);
    console.log('Current tempUserId:', tempUserId);
    console.log('Current subscription:', subscription);
  }, [userId, tempUserId, subscription]);

  return (
    <>
      <button className={`navbar-toggle ${isNavbarOpen ? 'open' : ''}`} onClick={toggleNavbar}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav className={`chat-navbar ${isNavbarOpen ? 'open' : ''}`}>
        <div className="navbar-header">
          <p>Integrate Faith with Everyday Acitivities</p>
        </div>
        <ul>
          <li>
            <Link to="/chat" onClick={toggleNavbar}>
              <FaCompass /> <span>Spiritual Direction</span>
            </Link>
          </li>
          <li>
            <Link to="/faith-journey" onClick={toggleNavbar}>
              <FaCross /> <span>Faith Journey</span>
            </Link>
          </li>
          <li>
            <Link to="/rewards" onClick={toggleNavbar}>
              <FaChartLine /> <span>Investing</span>
            </Link>
          </li>
        </ul>
        <div className="navbar-footer">
          <p>Let God's wisdom guide you.</p>
        </div>
      </nav>
      <div className="navbar-overlay" onClick={toggleNavbar}></div>
      {showSignupPopup && (
        <SignupPopup
          onClose={() => setShowSignupPopup(false)}
          onConfirm={() => {
            setShowSignupPopup(false);
            navigate('/signup');
          }}
        />
      )}
    </>
  );
};

export default Navbar;