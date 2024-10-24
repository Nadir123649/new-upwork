import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FaChartLine, FaUsers, FaBook, FaUserFriends, FaPlus, FaArrowRight, FaCog } from 'react-icons/fa';

import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import AssessmentModal from '../../components/AssessmentModal/AssessmentModal';
import ProgressTracker from '../../components/ProgressTracker/ProgressTracker';
import ChallengesDashboard from '../../components/ChallengesDashboard/ChallengesDashboard';
import CommunityEvents from '../../components/CommunityEvents/CommunityEvents';
import Reflections from '../../components/Reflections/Reflections';
import ChallengeCompletionModal from '../../components/ChallengeCompletionModal/ChallengeCompletionModal';
import { API_ENDPOINTS } from '../../config/api';
import { initializeUserId } from '../../store/actions/userActions';
import './FaithJourney.css';
import GroupList from '../../components/GroupList/GroupList';
import SimplifiedAssessment from '../../components/SimplifiedAssessment/SimplifiedAssessment';


const FaithJourney = () => {
  const { userId, tempUserId, isAuthorized } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [progressData, setProgressData] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [personalGoals, setPersonalGoals] = useState([]);
  const [activeTab, setActiveTab] = useState('challenges');
  const [userLevels, setUserLevels] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const navigate = useNavigate();

  const effectiveUserId = userId || tempUserId;

  useEffect(() => {
    if (!effectiveUserId) {
      console.log('No user ID found, initializing...');
      dispatch(initializeUserId());
    }
  }, [dispatch, effectiveUserId]);

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!effectiveUserId) {
        console.log('No effective user ID available, skipping fetch');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log(`Fetching assessment status for user ID: ${effectiveUserId}`);
          
        const response = await axios.get(`${API_ENDPOINTS.USER_ASSESSMENT_STATUS}/${effectiveUserId}`);

        console.log('Response from assessment status:', response.data);
        setAssessmentCompleted(response.data.assessmentCompleted);
        if (response.data.assessmentCompleted) {
          console.log('Assessment completed, fetching user data');
          await Promise.all([
            fetchProgressData(),
            fetchChallenges(),
            fetchPersonalGoals(),
            fetchUserLevels()
          ]);
          checkCompletedChallenges();
        } else {
          console.log('Assessment not completed, showing initial data');
          setProgressData({
            points: 5,
            level: 'Seeker',
            completedChallenges: 0
          });
        }
      } catch (error) {
        console.error('Error fetching user status:', error);
        setError(`Failed to load your Faith Journey. Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (effectiveUserId) {
      fetchUserStatus();
    } else {
      setIsLoading(false);
    }
  }, [effectiveUserId]);


  const handleJoinGroup = () => {
    setShowGroupsModal(true);
  };


  useEffect(() => {
    if (effectiveUserId) {
      fetchUserGroups();
    }
  }, [effectiveUserId]);

  const fetchUserGroups = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.GET_GROUPS}?user_id=${effectiveUserId}`);
      setUserGroups(response.data);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      setError('Failed to load your groups. Please try again.');
    }
  };

  const navigateToGroupPage = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const navigateToGroupDirectory = () => {
    navigate('/group-directory');
  };


  const fetchProgressData = async () => {
    try {
      console.log('Fetching progress data');
      const response = await axios.get(`${API_ENDPOINTS.USER_PROGRESS}/${effectiveUserId}`);
      console.log('Received progress data:', response.data);
      setProgressData(response.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setError('Failed to load your progress data. Please try again.');
    }
  };

  const handleStartAssessment = () => {
    if (effectiveUserId >= 4000) { // Check if it's a temp user ID
      setShowPopup(true);
    } else {
      setShowAssessment(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };


  useEffect(() => {
    const checkBannerPreference = async () => {
      if (!effectiveUserId) {
        console.log('No effective user ID available, skipping banner preference check');
        return;
      }
      try {
        console.log(`Fetching banner preference for user ID: ${effectiveUserId}`);
        const response = await axios.get(`${API_ENDPOINTS.GET_FAITH_BANNER_PREFERENCE}/${effectiveUserId}`);
        console.log('Banner preference response:', response.data);
        setShowBanner(!response.data.neverShowAgain);
      } catch (error) {
        console.error('Error fetching banner preference:', error);
        // Set a default value if the request fails
        setShowBanner(true);
      }
    };

    if (effectiveUserId) {
      checkBannerPreference();
    }
  }, [effectiveUserId]);


  useEffect(() => {
    if (showBanner) {
      document.body.classList.add('banner-visible');
    } else {
      document.body.classList.remove('banner-visible');
    }
  }, [showBanner]);



  const fetchChallenges = async () => {
    try {
      console.log('Fetching challenges');
      const response = await axios.get(`${API_ENDPOINTS.USER_CHALLENGES}/${effectiveUserId}`);
      console.log('Received challenges:', response.data);
      const challengesWithType = response.data.map(challenge => ({
        ...challenge,
        goalType: 'faith-challenge'
      }));
      setChallenges(challengesWithType);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setError('Failed to load your Challenges. Please try again.');
    }
  };

  const fetchPersonalGoals = async () => {
    try {
      console.log('Fetching personal goals');
      const response = await axios.get(`${API_ENDPOINTS.GOALS}/${effectiveUserId}`);
      console.log('Received personal goals:', response.data);
      const goalsWithType = response.data.map(goal => ({
        ...goal,
        goalType: 'personal-goal'
      }));
      setPersonalGoals(goalsWithType);
    } catch (error) {
      console.error('Error fetching personal goals:', error);
      setError('Failed to load your Personal Goals. Please try again.');
    }
  };


  const fetchUserLevels = async () => {
    try {
      console.log('Fetching user levels');
      const response = await axios.get(`${API_ENDPOINTS.USER_LEVELS}/${effectiveUserId}`);
      console.log('Received user levels:', response.data);
      setUserLevels(response.data);
    } catch (error) {
      console.error('Error fetching user levels:', error);
      setError('Failed to load your Spiritual Levels. Using default levels.');
      setUserLevels({
        "Sacramental Life": "Seeker",
        "Prayer and Scripture": "Seeker",
        "Community and Evangelization": "Seeker"
      });
    }
  };

  const checkCompletedChallenges = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.CHECK_COMPLETED_CHALLENGES}/${effectiveUserId}`);
      if (response.data.length > 0) {
        setCompletedChallenges(response.data);
        setShowCompletionModal(true);
      }
    } catch (error) {
      console.error('Error checking completed challenges:', error);
    }
  };

  const handleAssessmentSubmit = async (assessmentData) => {
    try {
      console.log('Submitting assessment data:', assessmentData);
      const response = await axios.post(`${API_ENDPOINTS.SUBMIT_ASSESSMENT}/${effectiveUserId}`, assessmentData);
      console.log('Assessment submission response:', response.data);
      setAssessmentCompleted(true);
      setShowAssessment(false);
      
      if (response.data.levels) {
        setUserLevels(response.data.levels);
      }
      
      console.log('Fetching updated user data after assessment');
      await Promise.all([
        fetchProgressData(),
        fetchChallenges(),
        fetchPersonalGoals()
      ]);
    } catch (error) {
      console.error('Error submitting assessment:', error);
      setError('Failed to submit your assessment. Please try again.');
    }
  };

  // In FaithJourney.js
  const handleChallengeUpdate = async (updaterOrChallenge) => {
    try {
      // If it's a function (from group challenges update)
      if (typeof updaterOrChallenge === 'function') {
        const updatedChallenges = updaterOrChallenge(challenges);
        setChallenges(updatedChallenges);
        return;
      }

      // If it's a regular challenge update
      const { challengeId, periodIndex, reflection, completed } = updaterOrChallenge;
      
      // Validate required fields before making the request
      if (!challengeId || periodIndex === undefined || !reflection) {
        console.error('Missing required fields:', { challengeId, periodIndex, reflection });
        return;
      }

      const payload = {
        challenge_id: challengeId,
        period_index: periodIndex,
        reflection: reflection,
        completed: completed
      };

      console.log('Sending challenge update with payload:', payload);
      
      const result = await axios.post(`${API_ENDPOINTS.UPDATE_CHALLENGE}/${effectiveUserId}`, payload);
      
      console.log('Challenge update result:', result.data);
      
      // Update the specific challenge in the state
      setChallenges(prevChallenges => 
        prevChallenges.map(challenge => 
          challenge.id === challengeId 
            ? {...challenge, period_progress: result.data.period_progress} 
            : challenge
        )
      );

      await Promise.all([fetchProgressData(), fetchUserLevels()]);
      if (result.data.challengeCompleted) {
        checkCompletedChallenges();
      }
      return result.data;
    } catch (error) {
      console.error('Error updating challenge:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  const handlePersonalGoalUpdate = async (goalId, periodIndex, reflection, completed) => {
    try {
      console.log(`Updating personal goal: ${goalId}, period: ${periodIndex}, reflection: ${reflection}, completed: ${completed}`);
      if (!goalId) {
        console.error('Goal ID is undefined');
        return;
      }
      const result = await axios.post(`${API_ENDPOINTS.UPDATE_PERSONAL_GOAL}/${effectiveUserId}`, {
        goal_id: goalId,
        period_index: periodIndex,
        reflection: reflection,
        completed: completed
      });
      console.log('Personal goal update result:', result.data);
      
      // Update the specific personal goal in the state
      setPersonalGoals(prevGoals => 
        prevGoals.map(goal => 
          goal.id === goalId 
            ? {...goal, weekly_progress: result.data.weekly_progress} 
            : goal
        )
      );

      await fetchProgressData();
      return result.data;
    } catch (error) {
      console.error('Error updating personal goal:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  };

  const handleGoalAdded = async (newGoal) => {
    console.log('New personal goal added:', newGoal);
    await fetchPersonalGoals();
  };

  const handleRemoveChallenge = async (challengeId, isPersonalGoal) => {
    try {
      if (isPersonalGoal) {
        await axios.delete(`${API_ENDPOINTS.REMOVE_PERSONAL_GOAL}/${userId}/${challengeId}`);
      } else {
        await axios.delete(`${API_ENDPOINTS.REMOVE_CHALLENGE}/${userId}/${challengeId}`);
      }
      // Refresh challenges after removal
      fetchChallenges();
      fetchPersonalGoals();
    } catch (error) {
      console.error('Error removing challenge:', error);
      setError('Failed to remove the challenge. Please try again.');
    }
  };

  const handleSelectNewChallenge = async (oldChallengeId, newChallenge) => {
    try {
      await axios.post(`${API_ENDPOINTS.SELECT_NEW_CHALLENGE}/${effectiveUserId}`, {
        old_challenge_id: oldChallengeId,
        new_challenge_id: newChallenge.id
      });
      await fetchChallenges();
      await fetchUserLevels();
    } catch (error) {
      console.error('Error selecting new challenge:', error);
    }
  };


  const handleAssessmentComplete = async (assessmentData) => {
    try {
      console.log('Assessment completed:', assessmentData);
      setAssessmentCompleted(true);
      
      // Assuming the SimplifiedAssessment component handles the API call to submit the assessment
      // You might need to update user levels and fetch new challenges here
      await Promise.all([
        fetchProgressData(),
        fetchChallenges(),
        fetchPersonalGoals(),
        fetchUserLevels()
      ]);
    } catch (error) {
      console.error('Error handling assessment completion:', error);
      setError('Failed to process your assessment. Please try again.');
    }
  };

  const renderGroupsSection = () => (
    <div className="groups-section bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="dashboard-header">
        <div className="groups-header-flex">
          <div className="dashboard-title">
            <FaUserFriends className="dashboard-icon" />
            <h2>Your Faith Groups</h2>
          </div>
          <button
            onClick={navigateToGroupDirectory}
            className="browse-groups-button"
          >
            <FaUsers className="mr-2" /> Browse All Groups
          </button>
        </div>
        
        {userGroups.length === 0 ? (
          <div className="empty-groups-message">
            <p>You haven't joined any groups yet. Join a faith group to share your journey and grow together in community.</p>
            <div className="empty-groups-divider"></div>
          </div>
        ) : (
          <p className="groups-subtitle">Your active group memberships:</p>
        )}
      </div>

      <div className="groups-content">
        {userGroups.length > 0 && (
          <div className="groups-grid">
            {userGroups.map(group => (
              <div key={group.id} className="group-card">
                <div className="group-card-content">
                  <div>
                    <h3 className="group-title">{group.name}</h3>
                    <p className="group-description">{group.description}</p>
                  </div>
                  <div className="group-actions">
                    <button
                      onClick={() => navigateToGroupPage(group.id)}
                      className="view-group-button"
                    >
                      <FaArrowRight className="button-icon" /> View
                    </button>
                    {group.is_admin && (
                      <Link
                        to={`/admin-panel/${group.id}`}
                        className="admin-group-button"
                      >
                        <FaCog className="button-icon" /> Admin
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => (
    <>
      <div className="tab-content">
        {activeTab === 'challenges' && (
          <ChallengesDashboard 
            challenges={challenges}
            personalGoals={personalGoals}
            userLevels={userLevels}
            onChallengeUpdate={handleChallengeUpdate}
            onPersonalGoalUpdate={handlePersonalGoalUpdate}
            onRemoveChallenge={handleRemoveChallenge}
            onInitiateNextChallenges={() => setShowCompletionModal(true)}
            userId={effectiveUserId}
            onGoalAdded={handleGoalAdded}
          />
        )}
      </div>

      <div className="assessment-banner" style={{
        background: `linear-gradient(135deg, var(--gradient-start), var(--gradient-end))`,
        borderRadius: '10px',
        padding: '30px',
        marginBottom: '30px',
        textAlign: 'center',
        boxShadow: '0 4px 15px var(--shadow-color)',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: 'white' }}>Set A Faith Activity</h2>
        <p style={{ fontSize: '16px', marginBottom: '20px', lineHeight: '1.6', color: 'white' }}>
          You'll be able to set a goal for the next four weeks for the activity; adding reflections at least once a week. The progress and reflections will then be incorporated in your spiritual direction.  
        </p>
        <SimplifiedAssessment
          userId={effectiveUserId}
          onAssessmentComplete={handleAssessmentComplete}
          buttonStyle={{
            backgroundColor: 'white',
            color: 'var(--primary-color)',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
          }}
          buttonHoverStyle={{
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 15px rgba(0, 0, 0, 0.2)'
          }}
        />
      </div>

      {renderGroupsSection()}


    </>
  );


  return (
    <div className="faith-journey-container">
      <Header />
      <Navbar />
      <div className="faith-journey-content">
        <div className="faith-journey-main">
          <div className="faith-journey-scrollable">          
            {isLoading ? (
              <div className="faith-journey-loading">
                <div className="loader"></div>
                <p>Loading your Faith Journey...</p>
              </div>
            ) : error ? (
              <div className="faith-journey-error">
                <p>Error: {error}</p>
                <button onClick={() => window.location.reload()} className="retry-button">Retry</button>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="close-popup" onClick={handleClosePopup}>&times;</button>
            <p>Please sign up to complete your assessment.</p>
            <Link to="/signup" className="signup-link">Sign Up</Link>
          </div>
        </div>
      )}
      {showCompletionModal && (
        <ChallengeCompletionModal
          completedChallenges={completedChallenges}
          onClose={() => setShowCompletionModal(false)}
          onSelectChallenge={handleSelectNewChallenge}
        />
      )}
      {showGroupsModal && (
        <div className="popup-overlay">
          <div className="popup groups-modal">
            <button className="close-popup" onClick={() => setShowGroupsModal(false)}>&times;</button>
            <h2>Join a Faith Group</h2>
            {/* Add group joining functionality here */}
            <p>Available groups will be listed here.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaithJourney;


