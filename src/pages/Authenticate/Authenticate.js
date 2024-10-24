import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import { fetchUserId } from '../../store/actions/userActions';
import './Authenticate.css';

const Authenticate = () => {
  const dispatch = useDispatch();
  const { isAuthorized, userId, tempUserId, email } = useSelector((state) => state.user);
  const [authUrl, setAuthUrl] = useState(null);

  useEffect(() => {
    if (isAuthorized && email && !userId) {
      dispatch(fetchUserId(email));
    }
  }, [isAuthorized, email, userId, dispatch]);

  const handleAuthenticate = async () => {
    try {
      const effectiveUserId = userId || tempUserId;
      const response = await axios.get(`http://localhost:5052/initiate_auth`, {
        params: { user_id: effectiveUserId }
      });
      if (response.data.auth_url) {
        setAuthUrl(response.data.auth_url);
        window.location.href = response.data.auth_url;
      } else {
        console.error('No auth_url received from the server');
      }
    } catch (error) {
      console.error('Error initiating authentication:', error);
    }
  };

  return (
    <div className="authenticate-container">
      <Header />
      <div className="authenticate-content">
        <Navbar />
        <div className="authenticate-main">
          <section className="authenticate-section welcome-section">
            <h1>Broker Connectivity</h1>
            <div className="welcome-text">
              <p>
                Invest in real-time through CrossValidation.ai by linking your online funded brokerage account. Upon investing via our platform with your Schwab account, you can use the investing chat to receive updates on your brokerage account details, execute new trades, or ask questions about your account information.
              </p>
              <p>
                The portfolio positions can also be queried in the research agent to understand the Catholic AI Efficiencies of your existing positions.
              </p>
            </div>
          </section>

          <section className="authenticate-section">
            <h2>Schwab Connectivity Options</h2>
            <p>Currently, we support Schwab connectivity for any of these three investing objectives:</p>
            <ol>
              <li>Have an optimal portfolio created for you upon creation with default allocations.</li>
              <li>Proceed with the four-step onboarding process to finetune your portfolio objectives such as sector allocations, number of positions, long-only vs long-short, with the ability for specific securities to be added/removed.</li>
              <li>Manually execute trades as you desire via inputting buys/sells manually in the investing agent.</li>
            </ol>
          </section>

          <section className="authenticate-section" id="authentication-process">
            <h2>Authentication Process</h2>
            <ol>
              <li>
                <h3>Open a Schwab Account</h3>
                <p>Open a Schwab Individual Brokerage account if you don't already have one (can fund directly during the onboarding process with a desired amount). This process takes about 15 minutes:</p>
                <a href="https://www.schwab.com/open-an-account" target="_blank" rel="noopener noreferrer" className="auth-link">Open Schwab Account</a>
              </li>
              <li>
                <h3>Enable Third-Party Access</h3>
                <p>Enable third-party platforms to trade on behalf of your Schwab account here:</p>
                <a href="https://client.schwab.com/app/trade/tradingtools/#/home/agreementprocess" target="_blank" rel="noopener noreferrer" className="auth-link">Enable Third-Party Access</a>
                <p>Enable connection to the Schwab Think or Swim platform to allow CrossValidation.ai to electronically place trades on behalf of your account directly via our platform.</p>
              </li>
              <li>
                <h3>Connect to CrossValidation.ai</h3>
                <p>Authenticate your Schwab account directly with your CrossValidation.ai platform by clicking this link:</p>
                {authUrl ? (
                  <a href={authUrl} className="auth-button" target="_blank" rel="noopener noreferrer">Authenticate Now</a>
                ) : (
                  <button onClick={handleAuthenticate} className="auth-button">Initiate Authentication</button>
                )}
              </li>
            </ol>
          </section>

          <section className="authenticate-section">
            <h2>Important Notes</h2>
            <ul>
              <li>Steps 1 and 2 only need to be completed one time.</li>
              <li>The connection allows us to remain connected with your account for one week.</li>
              <li>You may periodically have to re-authenticate when desiring to execute new orders via our platform.</li>
              <li>Upon completion of these three processes for the first time, you can go to the investing agent and directly query it for account-specific information.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Authenticate;