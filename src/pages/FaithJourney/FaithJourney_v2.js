import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import ProgressTracker from '../../components/ProgressTracker/ProgressTracker';
import ChallengesDashboard from '../../components/ChallengesDashboard/ChallengesDashboard';
import CommunityEvents from '../../components/CommunityEvents/CommunityEvents';
import Reflections from '../../components/Reflections/Reflections';
import ChallengeCompletionModal from '../../components/ChallengeCompletionModal/ChallengeCompletionModal';
import SimplifiedAssessment from '../../components/SimplifiedAssessment/SimplifiedAssessment';
import GroupList from '../../components/GroupList/GroupList';
import { API_ENDPOINTS } from '../../config/api';
import { initializeUserId } from '../../store/actions/userActions';
import './FaithJourney.css';
import { FaChartLine, FaUsers, FaBook } from 'react-icons/fa';

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
  const [showPopup, setShowPopup] = useState(false);

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

  const handleAssessmentComplete = async (assessmentData) => {
    try {
      console.log('Submitting assessment data:', assessmentData);
      const response = await axios.post(`${API_ENDPOINTS.SUBMIT_ASSESSMENT}/${effectiveUserId}`, assessmentData);
      console.log('Assessment submission response:', response.data);
      setAssessmentCompleted(true);
      
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

  const handleChallengeUpdate = async (challengeId, periodIndex, reflection, completed) => {
    try {
      console.log(`Updating challenge: ${challengeId}, period: ${periodIndex}, reflection: ${reflection}, completed: ${completed}`);
      const result = await axios.post(`${API_ENDPOINTS.UPDATE_CHALLENGE}/${effectiveUserId}`, {
        challenge_id: challengeId,
        period_index: periodIndex,
        reflection: reflection,
        completed: completed
      });
      console.log('Challenge update result:', result.data);
      
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

  const handleStartAssessment = () => {
    if (effectiveUserId >= 4000) {
      setShowPopup(true);
    } else {
      // Logic to start the assessment
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const renderContent = () => (
    <>
      <ProgressTracker 
        points={progressData?.points || 0}
        level={progressData?.level || 'Seeker'}
        completedChallenges={progressData?.completedChallenges || 0}
        faithAreas={userLevels}
        isLoggedIn={isAuthorized}
        assessmentCompleted={assessmentCompleted}
        isTempUser={effectiveUserId >= 4000}
      />

      {!assessmentCompleted && (
        <div className="simplified-assessment-container">
          <SimplifiedAssessment
            userId={effectiveUserId}
            onAssessmentComplete={handleAssessmentComplete}
          />
        </div>
      )}

      <div className="tab-navigation">
        <button 
          onClick={() => setActiveTab('challenges')}
          className={activeTab === 'challenges' ? 'active' : ''}
        >
          <FaChartLine /> Active Challenges
        </button>
        <button 
          onClick={() => setActiveTab('community')}
          className={activeTab === 'community' ? 'active' : ''}
        >
          <FaUsers /> Events
        </button>
        <button 
          onClick={() => setActiveTab('reflections')}
          className={activeTab === 'reflections' ? 'active' : ''}
        >
          <FaBook /> Reflections
        </button>
      </div>
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
        {activeTab === 'community' && (
          <CommunityEvents 
            userId={effectiveUserId}
          />
        )}
        {activeTab === 'reflections' && (
          <Reflections 
            userId={effectiveUserId}
          />
        )}
      </div>
    </>
  );


  return (
    <div className="faith-journey-container">
      <Header />
      <Navbar />
      <div className="faith-journey-content">
        <div className="faith-journey-sidebar">
          <GroupList userId={effectiveUserId} />
        </div>
        <div className="faith-journey-main">
          <div className="faith-journey-scrollable">
            <h1 className="faith-journey-title">Your Faith Journey</h1>
            <p className="faith-journey-explanation">
              Set and track personalized faith challenges, reflect on your spiritual journey, and earn points for your progress.
            </p>
            
            {showCompletionModal && (
              <ChallengeCompletionModal
                completedChallenges={completedChallenges}
                onClose={() => setShowCompletionModal(false)}
                onSelectChallenge={handleSelectNewChallenge}
              />
            )}
            
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
    </div>
  );
};

export default FaithJourney;

