import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch, Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import Swal from 'sweetalert2';
import './Navbar.css';
import SignUpForm from '../SignUpForm/SignUpForm';
import { setUserId } from '../../store/actions/userActions';
import store from '../../store/store';  // Import your Redux store

const Navbar = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { userId, tempUserId, subscription } = useSelector(state => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  const handleInvestingAgentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const effectiveUserId = userId || tempUserId;

    if (effectiveUserId && effectiveUserId > 4000) {
      if (subscription !== 'realtime-trading') {
        Swal.fire({
          title: 'Signup To Begin Investing',
          html: `
            <div class="plan-info">
              <p>
                Choose your sector allocation, investment amount, and number of stocks. We'll then create your optimal Catholic Generative AI Efficienct portfolio! 
              </p>
              <p>
                Connect your Schwab brokerage account to invest directly through our chat agent for a $20 monthly fee.   
              </p>
              <p>
                By registering you confirm that you have read and agree to our
                <a 
                  href="https://docs.google.com/document/d/1lbq3nwlzCUtoYLNQM94qaiYvVOD1EXS_mNYbp3LQN0o/edit?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  terms and conditions
                </a>.
              </p>
            </div>
            <div id="signup-form-container"></div>
          `,
          showConfirmButton: false,
          showCloseButton: true,
          customClass: {
            container: 'custom-swal-container',
            popup: 'custom-swal-popup',
            header: 'custom-swal-header',
            title: 'custom-swal-title',
            closeButton: 'custom-swal-close-button',
            content: 'custom-swal-content',
          },
          didOpen: () => {
            const container = Swal.getPopup().querySelector('#signup-form-container');
            const root = createRoot(container);
            root.render(
              <Provider store={store}>
                <SignUpForm onSuccess={(userId) => {
                  dispatch(setUserId(userId));
                  Swal.close();
                  navigate('/invest', { state: { newUser: true, userId: userId } });
                }} />
              </Provider>
            );
          }
        });
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