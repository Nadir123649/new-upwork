import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Navbar.css';

const Navbar = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const { schwabAuthorized } = useSelector(state => state.auth);

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };

  return (
    <nav className={`chat-navbar ${isNavbarOpen ? 'open' : ''}`}>
      <div className="chat-navbar-toggle" onClick={toggleNavbar}>&#9776;</div>
      <ul>
        <li><Link to="/chat">Investing Agent</Link></li>
        <li><Link to="/about">About Us</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;