import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchUserId } from '../../store/actions/userActions';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import { API_ENDPOINTS } from '../../config/api';
import { FaCopy, FaUsers } from 'react-icons/fa';
import './Refer.css';

const Refer = () => {
  const { isAuthorized, userId, email } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthorized && email && !userId) {
      dispatch(fetchUserId(email));
    }
    setIsLoading(false);
  }, [isAuthorized, email, userId, dispatch]);

  const handleShareReferralLink = () => {
    const referralLink = `https://crossvalidation.ai/signup/${userId}`;
    navigator.clipboard.writeText(referralLink).then(() => {
      alert('Referral link copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
      alert('Failed to copy referral link. Please try again.');
    });
  };

  return (
    <div className="refer-container">
      <Header />
      <div className="refer-content challenges-dashboard refer-star">
        <Navbar />
        <div className="refer-main ">
          <section className="refer-header">
            <h1>Refer Friends & Earn Rewards</h1>
          </section>

          <section className="refer-description">
            <p>
              Invite your friends to join CrossValidation.ai and earn rewards for their participation and investments.
            </p>
          </section>

          <section className="refer-rewards">
            <h2>Referral Rewards</h2>
            <ul>
              <li>Earn $10 per month for each premium subscriber you refer</li>
              <li>Get additional rewards based on the total assets invested by your referrals:
                <ul>
                  <li>5,000 invested: 100 bonus points</li>
                  <li>25,000 invested: 500 bonus points</li>
                  <li>100,000 invested: 2,000 bonus points</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="referral-section">
            <h2><FaUsers /> Invite Friends</h2>
            {isLoading ? (
              <p>Loading referral information...</p>
            ) : error ? (
              <p className="error-message">Error: {error}. Please try again.</p>
            ) : userId ? (
              <>
                <p>Share your unique referral link to start earning rewards!</p>
                <div className="referral-link-container">
                  <input 
                    type="text" 
                    value={`https://crossvalidation.ai/signup/${userId}`} 
                    readOnly 
                    className="referral-link"
                  />
                  <button className="copy-button" onClick={handleShareReferralLink}>
                    <FaCopy /> Copy
                  </button>
                </div>
              </>
            ) : (
              <p>Please <Link to="/signin">sign in</Link> or <Link to="/signup">register</Link> to get your referral link.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Refer;