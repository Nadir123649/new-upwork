import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import './Navbar.css';

const Navbar = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { userId, tempUserId, subscription } = useSelector(state => state.user);
  const navigate = useNavigate();

  console.log('Current userId:', userId);
  console.log('Current tempUserId:', tempUserId);
  console.log('Current subscription:', subscription);

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const handleInvestingAgentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('handleInvestingAgentClick triggered');
    console.log('Subscription status:', subscription);

    const effectiveUserId = userId || tempUserId;

    if (effectiveUserId && effectiveUserId > 4000) {
      if (subscription !== 'realtime-trading') {
        console.log('Showing signup popup');
        Swal.fire({
          title: 'Signup Required For Investing Agent',
          html: `
            <p>Provide inputs related to sector, number of holdings, and investment amount to have your optimal portfolio created (or use all default values).</p>
            <p>Then decide if you want to invest real money by connecting your Schwab account (real-time investing is a paid $20 feature).</p>
          `,
          icon: 'info',
          showCancelButton: true,
          confirmButtonColor: '#00b250',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Sign Up',
          cancelButtonText: 'Close',
          customClass: {
            container: 'custom-swal-container',
            popup: 'custom-swal-popup',
            header: 'custom-swal-header',
            title: 'custom-swal-title',
            closeButton: 'custom-swal-close-button',
            content: 'custom-swal-content',
            confirmButton: 'custom-swal-confirm-button',
            cancelButton: 'custom-swal-cancel-button'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            console.log('User confirmed signup, navigating to /signup');
            navigate('/signup');
          } else {
            console.log('User cancelled signup');
          }
        });
      } else {
        console.log('User has realtime-trading subscription, navigating to /invest');
        navigate('/invest');
      }
    } else {
      console.log('Effective User ID is 4000 or less, or not set. Navigating to /invest without popup');
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
        <ul>
          <li><Link to="/chat" onClick={toggleNavbar}>Catholic AI Efficiency Index</Link></li>
          <li>
            <a 
              href="#" 
              onClick={(e) => {
                handleInvestingAgentClick(e);
                toggleNavbar();
              }}
            >
              Investing Agent
            </a>
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