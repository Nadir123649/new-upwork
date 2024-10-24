import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FaChartLine, FaTasks, FaCalendarCheck, FaLock, FaUsers } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';
import './ChallengesDashboard.css';

const ChallengesDashboard = ({ 
  challenges, 
  personalGoals,
  userLevels, 
  onChallengeUpdate, 
  onPersonalGoalUpdate,
  onInitiateNextChallenges,
  userId
}) => {
  const [expandedChallenge, setExpandedChallenge] = useState(null);
  const [reflections, setReflections] = useState({});
  const [allChallenges, setAllChallenges] = useState([]);

  const sampleChallenge = {
    id: 'sample-challenge',
    description: 'Attend digital gospel event November 3rd. Pray about the discussion then add a reflection.',
    category: 'Custom Goals.',
    period_prompts: [
      'Prompt CrossValidation.ai Spiritual Director for gospel verses related to a challenge faced today.',
      'Read the November 3rd Sunday gospel to reflect on the repetence of Zacchaeus, his obstacles, and the message from Jesus. How does this relate to your life?',
      'Set a weekly scripture reading and reflection routine. Tie is into your daily activities.  ',
      'Attend a gospel reflection and share your thoughts with a friend. Invite them to discuss a Sunday gospel.'
    ],
    period_progress: ['not_started', 'not_started', 'not_started', 'not_started'],
    start_date: moment().format('YYYY-MM-DD')
  };

  useEffect(() => {
    console.log('ChallengesDashboard received challenges:', challenges);
    console.log('ChallengesDashboard received personalGoals:', personalGoals);
    console.log('ChallengesDashboard received userLevels:', userLevels);
    fetchAllChallenges();
  }, [challenges, personalGoals, userLevels, userId]);

  const fetchAllChallenges = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ALL_CHALLENGES.replace(':userId', userId));
      const fetchedChallenges = response.data;
      
      // Combine fetched challenges with existing challenges and personal goals
      const combinedChallenges = [
        ...challenges.map(c => ({ ...c, isGroupChallenge: false })),
        ...personalGoals.map(g => ({ ...g, isGroupChallenge: false, goalType: 'personal-goal' })),
        ...fetchedChallenges.filter(fc => fc.is_group_challenge).map(gc => ({ ...gc, isGroupChallenge: true }))
      ];

      setAllChallenges(combinedChallenges);
    } catch (error) {
      console.error('Error fetching all challenges:', error);
    }
  };

  const handlePeriodUpdate = async (challengeId, periodIndex, reflection, completed) => {
    try {
      const reflectionText = reflection || reflections[challengeId]?.[periodIndex] || '';
      if (!reflectionText.trim()) {
        alert("Please provide a reflection before checking in.");
        return;
      }

      const endpoint = `${API_ENDPOINTS.CHECK_IN_CHALLENGE}/${userId}`;
      const payload = {
        challenge_id: challengeId,
        period_index: periodIndex,
        reflection: reflectionText,
        completed: completed
      };

      console.log('Sending check-in to:', endpoint);
      console.log('Payload:', payload);

      const response = await axios.post(endpoint, payload);
      console.log('Check-in result:', response.data);

      setReflections(prev => ({
        ...prev,
        [challengeId]: {
          ...prev[challengeId],
          [periodIndex]: ''
        }
      }));

      if (response.data.challengeCompleted) {
        alert('Challenge completed! Please review and select your next challenge.');
        onInitiateNextChallenges();
      } else {
        alert('Check-in successful!');
      }

      onChallengeUpdate(challengeId, periodIndex, reflectionText, completed);

    } catch (error) {
      console.error('Error checking in:', error);
      alert(`Failed to check in: ${error.message}`);
    }
  };

  const handleReflectionChange = (challengeId, periodIndex, text) => {
    setReflections(prev => ({
      ...prev,
      [challengeId]: {
        ...prev[challengeId],
        [periodIndex]: text
      }
    }));
  };

  const toggleExpandChallenge = (challengeId) => {
    setExpandedChallenge(expandedChallenge === challengeId ? null : challengeId);
  };

  const getProgressPercentage = (challenge) => {
    const progress = challenge.period_progress || challenge.weekly_progress || [];
    if (progress.length === 0) return 0;
    const completedPeriods = progress.filter(period => period === 'completed').length;
    return (completedPeriods / progress.length) * 100;
  };

  const getPeriodDates = (startDate, periodIndex) => {
    if (!startDate) return '';
    const start = moment(startDate).add(periodIndex * 7, 'days').startOf('week');
    const end = moment(start).endOf('week');
    return `${start.format('MMM D')} - ${end.format('MMM D')}`;
  };

  const getHardcodedPrompts = (challenge) => {
    const hardcodedPrompts = {
      "Sacramental Life": {
        "Do one Catholic activity each week": [
          "Light a candle at a church or cemetery",
          "Watch a YouTube video on Fr. Mike Schmitz (search for Eucharist, Mass, or Confession)",
          "Visit a Catholic church and spend 10 minutes in quiet reflection",
          "Listen to a Catholic podcast episode and reflect on it using CrossValidation.ai"
        ],
        "Attend Sunday Mass": [
          "Read and reflect on the Sunday Gospel before Mass",
          "Attend Mass one Sunday",
          "Talk to someone within the parish community after Mass",
          "Write down one key message from the homily"
        ],
        // ... (other Sacramental Life prompts)
      },
      "Prayer and Scripture": {
        "Establish a daily prayer habit": [
          "Set aside 5 minutes each day for prayer",
          "Try different prayer methods (vocal, mental, contemplative)",
          "Use a guided prayer resource or app",
          "Write a reflection on your experience in prayer"
        ],
        // ... (other Prayer and Scripture prompts)
      },
      "Community and Evangelization": {
        "Participate in a Gospel Reflection Group": [
          "Review the Gospel and consider its relevance to your life",
          "Participate in a group discussion or call",
          "Share your experience with another person",
          "Reflect on the group discussion using CrossValidation.ai or a journal"
        ],
        // ... (other Community and Evangelization prompts)
      }
    };

    return hardcodedPrompts[challenge.category]?.[challenge.description] || Array(4).fill("Reflect on your progress this week");
  };

  const renderChallenge = (challenge) => {
    console.log('Rendering challenge:', challenge);
    const isCustomGoal = challenge.goalType === 'personal-goal';
    const isGroupChallenge = challenge.isGroupChallenge;
    console.log('Is custom goal:', isCustomGoal);
    console.log('Is group challenge:', isGroupChallenge);

    let prompts;
    if (isCustomGoal) {
      console.log('Custom goal weekly_prompts:', challenge.weekly_prompts);
      prompts = challenge.weekly_prompts || [];
      console.log('Custom goal prompts:', prompts);
    } else if (challenge.id === 'sample-challenge') {
      prompts = challenge.period_prompts;
    } else {
      prompts = getHardcodedPrompts(challenge);
    }
    
    console.log('Final prompts used:', prompts);

    const progress = challenge.weekly_progress || challenge.period_progress || Array(4).fill('not_started');
    console.log('Challenge progress:', progress);

    const isTitleLong = challenge.description.length > 17;

    return (
      <div key={challenge.id} className="challenge-card">
        <div className="challenge-header">
          <h4 className={isTitleLong ? 'long-title' : ''}>
            {challenge.description}
          </h4>
          <span className="challenge-type">
            {challenge.category} {isCustomGoal ? 'Goal' : 'Challenge'}
            {isGroupChallenge && (
              <span className="group-indicator">
                <FaUsers title="Group Challenge" /> {challenge.group_name}
              </span>
            )}
          </span>
        </div>
        <div className="challenge-progress">
          <div className="progress-bar" style={{ width: `${getProgressPercentage(challenge)}%` }}></div>
        </div>
        <p className="progress-text">Progress: {getProgressPercentage(challenge).toFixed(0)}%</p>
        <button onClick={() => toggleExpandChallenge(challenge.id)} className="expand-button">
          {expandedChallenge === challenge.id ? 'Hide Details' : 'Show Details'}
        </button>
        {expandedChallenge === challenge.id && (
          <div className="challenge-details">
            {[0, 1, 2, 3].map((index) => {
              const prompt = prompts[index] || "Reflect on your progress this week";
              const isCompleted = progress[index] === 'completed';
              console.log(`Week ${index + 1} prompt:`, prompt);
              console.log(`Week ${index + 1} completed:`, isCompleted);
              if (isCompleted) return null;

              return (
                <div key={`${challenge.id}-week-${index}`} className="period-prompt">
                  <h5>Week {index + 1} {challenge.start_date && `(${getPeriodDates(challenge.start_date, index)})`}</h5>
                  <p>{prompt}</p>
                  <textarea 
                    placeholder="Share your reflection (2-4 sentences)..."
                    value={reflections[challenge.id]?.[index] || ''}
                    onChange={(e) => handleReflectionChange(challenge.id, index, e.target.value)}
                  />
                  {challenge.id === 'sample-challenge' ? (
                    <button 
                      className="check-in-button disabled"
                      disabled
                      title="Register to check-in on goals"
                    >
                      <FaLock /> Complete assessment to check-in
                    </button>
                  ) : (
                    <button 
                      onClick={() => isCustomGoal 
                        ? onPersonalGoalUpdate(challenge.id, index, reflections[challenge.id]?.[index], true)
                        : handlePeriodUpdate(challenge.id, index, reflections[challenge.id]?.[index], true)
                      }
                      className="check-in-button"
                    >
                      <FaCalendarCheck /> Check-in
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Group challenges by category
  const groupedChallenges = allChallenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = [];
    }
    acc[challenge.category].push(challenge);
    return acc;
  }, {});

  console.log('Grouped challenges:', groupedChallenges);

  return (
    <div className="challenges-dashboard">
      <h2><FaChartLine /> Your Faith Journey Challenges</h2>
      <div className="categories-container">
        {Object.entries(groupedChallenges).map(([category, categoryChallenges]) => (
          <div key={category} className="category-section">
            <h3><FaTasks /> {category}</h3>
            <p className="category-level">Level: {userLevels[category] || 'Custom Goal'}</p>
            <div className="challenges-list">
              {categoryChallenges.map(challenge => renderChallenge(challenge))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengesDashboard;