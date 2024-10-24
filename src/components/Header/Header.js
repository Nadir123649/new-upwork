import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../store/actions/userActions';
import { FaUser, FaSignOutAlt, FaInfoCircle, FaSignInAlt, FaUserPlus, FaUserFriends, FaTools } from 'react-icons/fa';
import './Header.css';
import logoWithName from './logo.png';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, tempUserId, isAuthorized } = useSelector((state) => state.user);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

  const accountDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="chat-header">
      <Link to="/chat" className="chat-logo">
        <img src={logoWithName} alt="Logo" />
        <span>CrossValidation.ai</span>
      </Link>
      <nav className="header-nav">
        <Link to="/chat" className={location.pathname === '/chat' ? 'active' : ''}>Spiritual Direction</Link>
        <Link to="/faith-journey" className={location.pathname === '/faith-journey' ? 'active' : ''}>Faith Journey</Link>
      </nav>
      <div className="chat-account" ref={accountDropdownRef}>
        <button onClick={toggleAccountDropdown} className="account-button">
          <FaUser />
          <span>{isAuthorized ? 'Profile' : 'Account'}</span>
        </button>
        {isAccountDropdownOpen && (
          <div className="chat-account-dropdown">
            {!isAuthorized ? (
              <>
                <Link to="/about"><FaInfoCircle /> About</Link>
                <Link to="/refer"><FaUserFriends /> Refer</Link>
                <Link to="/signin"><FaSignInAlt /> Login</Link>
                <Link to="/signup"><FaUserPlus /> Signup</Link>
              </>
            ) : (
              <>
                <Link to="/profile"><FaUser /> Profile</Link>
                <Link to="/refer"><FaUserFriends /> Refer</Link>
                <button onClick={handleLogout}><FaSignOutAlt /> Logout</button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;