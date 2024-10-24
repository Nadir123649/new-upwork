import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/actions/userActions';
import './Header.css';
import logoWithName from './logo.png';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userId, tempUserId } = useSelector((state) => state.user);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };

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

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="chat-header">
      <Link to="/chat" className="chat-logo">
        <img src={logoWithName} alt="Logo" />
        <span>CrossValidation.ai</span>
      </Link>
      <div
        className="chat-account"
        ref={accountDropdownRef}
        onClick={toggleAccountDropdown}
      >
        Account
        {isAccountDropdownOpen && (
          <div className="chat-account-dropdown">
            {!isAuthenticated ? (
              <>
                <Link to="/signin">Login</Link>
                <Link to="/signup">Signup</Link>
              </>
            ) : (
              <>
                <Link to="/profile">Profile</Link>
                <a href="#" onClick={handleLogout}>Logout</a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;