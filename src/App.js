import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Chat from './pages/Chat/Chat';
import SignUp from './pages/SignUp/SignUp';
import SignIn from './pages/SignIn/SignIn';
import About from './pages/About/About';
import Authenticate from './pages/Authenticate/Authenticate';
import './App.css';
import ObjectivesChat from './pages/ObjectivesChat/ObjectivesChat';
import Profile from './pages/Profile/Profile';
import Trade from './pages/Trade/Trade';
import BrokerageAccount from './pages/BrokerageAccount/BrokerageAccount';
import { setUserId } from './store/actions/userActions';
import SchwabCallback from './components/SchwabCallback';
import FaithJourney from './pages/FaithJourney/FaithJourney';
import Rewards from './pages/Rewards/Rewards';
import Refer from './pages/Refer/Refer';
import Build from './pages/Build/Build';
import GoogleAnalytics from './GoogleAnalytics';
import GroupDirectory from './pages/GroupDirectory/GroupDirectory';
import GroupPage from './pages/GroupPage/GroupPage';
import AdminPanel from './pages/AdminPanel/AdminPanel';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  const isAuthorized = useSelector(state => state.user.isAuthorized);

  useEffect(() => {
    // Original userId logic
    const userId = localStorage.getItem('userId');
    if (userId) {
      dispatch(setUserId(userId));
    }

    // Add viewport height calculation
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial viewport height
    setViewportHeight();

    // Update on resize events
    const handleResize = () => {
      // Debounce the resize event
      if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
          return setTimeout(callback, 1000 / 60);
        };
      }
      window.requestAnimationFrame(setViewportHeight);
    };

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      // Short delay to ensure orientation change is complete
      setTimeout(setViewportHeight, 100);
    });

    // Load orientation change
    setViewportHeight();

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, [dispatch]);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <GoogleAnalytics />
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Chat />} />
            <Route path="/chat" element={<Chat />} />
            <Route
              path="/objectives-chat"
              element={isAuthenticated ? <ObjectivesChat /> : <SignIn />}
            />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signup/:referralId" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/about" element={<About />} />
            <Route path="/authenticate" element={<Authenticate />} />
            <Route
              path="/profile"
              element={isAuthorized ? <Profile /> : <SignIn />}
            />
            <Route
              path="/trade"
              element={isAuthenticated ? <Trade /> : <SignIn />}
            />
            <Route
              path="/brokerage-account"
              element={isAuthenticated ? <BrokerageAccount /> : <SignIn />}
            />
            <Route path="/schwab-callback" element={<SchwabCallback />} />
            <Route path="/callbacks" element={<SchwabCallback />} />
            <Route path="/faith-journey" element={<FaithJourney />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/refer" element={<Refer />} />
            <Route path="/build" element={<Build />} />
            <Route path="/group-directory" element={<GroupDirectory />} />
            <Route path="/group/:groupId/admin" element={<AdminPanel />} />
            <Route path="/group/:groupId" element={<GroupPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
