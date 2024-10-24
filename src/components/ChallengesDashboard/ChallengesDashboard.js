import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FaChartLine, FaTasks, FaCalendarCheck, FaLock, FaSpinner, FaUsers, FaPlusCircle, FaList } from 'react-icons/fa';
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
  const [loading, setLoading] = useState({});
  const [localReflections, setLocalReflections] = useState({});
  const [groupNames, setGroupNames] = useState({});
  const [groupChallengesLoaded, setGroupChallengesLoaded] = useState(false);
  const [weeklyReflections, setWeeklyReflections] = useState({}); 
  const [showAllReflections, setShowAllReflections] = useState({});

  const sampleChallenge = {
    id: 'sample-challenge',
    description: 'Attend digital gospel event November 3rd. Pray about the discussion then add a reflection.',
    category: 'Custom Goals.',
    period_prompts: [
      'Prompt CrossValidation.ai Spiritual Director for gospel verses related to a challenge faced today.',
      'Read the November 3rd Sunday gospel to reflect on the repetence of Zacchaeus, his obstacles, and the message from Jesus. How does this relate to your life?',
      'Set a weekly scripture reading and reflection routine. Tie is into your daily activities.',
      'Attend a gospel reflection and share your thoughts with a friend. Invite them to discuss a Sunday gospel.'
    ],
    period_progress: ['not_started', 'not_started', 'not_started', 'not_started'],
    start_date: moment().format('YYYY-MM-DD')
  };

  useEffect(() => {
    console.log('==================== Initial Challenge Data ====================');
    console.log('Raw challenges:', challenges);
    console.log('Raw personal goals:', personalGoals);
    console.log('User levels:', userLevels);
    
    const groupChallenges = challenges.filter(c => c.group_id);
    console.log('Group challenges found:', groupChallenges);
    console.log('Group names:', groupNames);
  }, [challenges, personalGoals, userLevels, groupNames]);
    
  useEffect(() => {
    const fetchWeeklyReflections = async (challengeId) => {
      if (!challengeId || !userId) return;
      
      try {
        // Correctly construct the URL by appending the parameters
        const response = await axios.get(
          `${API_ENDPOINTS.GET_CHALLENGE_REFLECTIONS}/${challengeId}/${userId}`
        );
        
        if (response.data && response.data.reflections) {
          setWeeklyReflections(prev => ({
            ...prev,
            [challengeId]: response.data.reflections
          }));
        }
      } catch (error) {
        console.error('Error fetching weekly reflections:', error);
      }
    };

    if (expandedChallenge) {
      fetchWeeklyReflections(expandedChallenge);
    }
  }, [expandedChallenge, userId]);


  useEffect(() => {
    const fetchGroupChallenges = async () => {
      if (groupChallengesLoaded) return;

      try {
        const groupsResponse = await axios.get(`${API_ENDPOINTS.GET_GROUPS}?user_id=${userId}`);
        const userGroups = groupsResponse.data.filter(group => group.is_member);
        
        const groupChallenges = await Promise.all(
          userGroups.map(async (group) => {
            try {
              const endpoint = `${API_ENDPOINTS.GROUP_CHALLENGES_LIST.replace(':groupId', group.id)}?userId=${userId}`;
              const response = await axios.get(endpoint);
              
              return response.data
                .filter(challenge => challenge.is_participating)
                .map(challenge => ({
                  ...challenge,
                  group_id: group.id,
                  group_name: group.name,
                  isGroupChallenge: true,
                  category: 'Group Challenges'
                }));
            } catch (error) {
              console.error(`Error fetching challenges for group ${group.id}:`, error);
              return [];
            }
          })
        );

        const allGroupChallenges = groupChallenges.flat();
        
        if (allGroupChallenges.length > 0) {
          onChallengeUpdate(prevChallenges => {
            if (!prevChallenges) return allGroupChallenges;
            
            const nonGroupChallenges = prevChallenges.filter(c => !c.group_id && !c.isGroupChallenge);
            const newChallenges = [...nonGroupChallenges, ...allGroupChallenges];
            
            if (JSON.stringify(prevChallenges) === JSON.stringify(newChallenges)) {
              return prevChallenges;
            }
            
            return newChallenges;
          });
        }

        setGroupChallengesLoaded(true);
      } catch (error) {
        console.error('Error fetching group challenges:', error);
      }
    };

    if (userId && !groupChallengesLoaded) {
      fetchGroupChallenges();
    }
  }, [userId, groupChallengesLoaded, onChallengeUpdate]);

  useEffect(() => {
    const fetchGroupNames = async () => {
      try {
        const groupIds = [...new Set(challenges
          .filter(c => c.group_id)
          .map(c => c.group_id))];
        
        if (groupIds.length > 0) {
          try {
            const response = await axios.get(`${API_ENDPOINTS.GET_GROUPS}?user_id=${userId}`);
            const groupsMap = {};
            response.data.forEach(group => {
              if (groupIds.includes(group.id)) {
                groupsMap[group.id] = group.name;
              }
            });
            setGroupNames(groupsMap);
          } catch (error) {
            console.error('Error fetching group names:', error);
            setGroupNames({});
          }
        } else {
          setGroupNames({});
        }
      } catch (error) {
        console.error('Error processing group IDs:', error);
        setGroupNames({});
      }
    };

    fetchGroupNames();
  }, [challenges, userId]);
    

  // In ChallengesDashboard.js
  const handlePeriodUpdate = async (challengeId, periodIndex, reflection, completed, isAdditionalReflection = false) => {
    if (loading[challengeId]) {
      console.log('Request already in progress for this challenge');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, [challengeId]: true }));
      
      // Get reflection text, with proper validation
      const reflectionText = reflection || reflections[challengeId]?.[periodIndex] || '';
      
      if (!reflectionText.trim()) {
        alert("Please provide a reflection before checking in.");
        return;
      }

      if (!challengeId || periodIndex === undefined) {
        console.error('Missing required parameters:', { challengeId, periodIndex });
        return;
      }

      const payload = {
        challenge_id: parseInt(challengeId, 10),
        period_index: parseInt(periodIndex, 10),
        reflection: reflectionText.trim(),
        completed: Boolean(completed),
        timestamp: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
        is_additional: Boolean(isAdditionalReflection)
      };

      console.log('Sending request with payload:', payload);

      const response = await axios.post(
        `${API_ENDPOINTS.CHALLENGES}/${userId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Update states only after successful response
        setWeeklyReflections(prev => ({
          ...prev,
          [challengeId]: {
            ...(prev[challengeId] || {}),
            [periodIndex]: [
              ...(prev[challengeId]?.[periodIndex] || []),
              {
                reflection: reflectionText,
                timestamp: payload.timestamp,
                is_additional: payload.is_additional
              }
            ]
          }
        }));

        // Clear the reflection input
        setReflections(prev => ({
          ...prev,
          [challengeId]: {
            ...prev[challengeId],
            [periodIndex]: ''
          }
        }));

        // Update local reflections
        setLocalReflections(prev => ({
          ...prev,
          [challengeId]: {
            ...(prev[challengeId] || {}),
            [periodIndex]: reflectionText
          }
        }));

        if (response.data.challengeCompleted) {
          alert('Challenge completed! Please review and select your next challenge.');
          onInitiateNextChallenges?.();
        } else {
          alert('Check-in successful!');
        }

        // Update parent component
        if (typeof onChallengeUpdate === 'function') {
          await onChallengeUpdate({
            challengeId,
            periodIndex,
            reflection: reflectionText,
            completed
          });
        }
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to check in: ${error.response?.data?.error || error.message || 'An unexpected error occurred'}`);
    } finally {
      setLoading(prev => ({ ...prev, [challengeId]: false }));
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

  const toggleShowAllReflections = (challengeId, periodIndex) => {
    setShowAllReflections(prev => ({
      ...prev,
      [challengeId]: {
        ...(prev[challengeId] || {}),
        [periodIndex]: !(prev[challengeId]?.[periodIndex])
      }
    }));
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

  const renderChallenge = (challenge) => {
    const isCustomGoal = challenge.goalType === 'personal-goal';
    const isGroupChallenge = Boolean(challenge.group_id) || challenge.isGroupChallenge;
    
    let prompts;
    if (isGroupChallenge) {
      prompts = challenge.weekly_prompts || challenge.period_prompts || [];
    } else if (isCustomGoal) {
      prompts = challenge.weekly_prompts || [];
    } else if (challenge.id === 'sample-challenge') {
      prompts = challenge.period_prompts;
    } else {
      prompts = Array(4).fill("Reflect on your progress this week");
    }

    const progress = challenge.weekly_progress || challenge.period_progress || Array(4).fill('not_started');
    const savedReflections = challenge.weekly_reflections || challenge.period_reflections || Array(4).fill('');
    const isTitleLong = (challenge.title || challenge.description || '').length > 17;

    return (
      <div key={challenge.id} className="challenge-card">
        <div className="challenge-header">
          {isGroupChallenge && (
            <div className="group-badge">
              <FaUsers /> {challenge.group_name || groupNames[challenge.group_id] || 'Group Challenge'}
            </div>
          )}
          <h4 className={isTitleLong ? 'long-title' : ''}>
            {challenge.title || challenge.description}
          </h4>
          <span className="challenge-type">
            {isGroupChallenge ? 'Group Challenge' : `${challenge.category} ${isCustomGoal ? 'Goal' : 'Challenge'}`}
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
              const weekReflections = weeklyReflections[challenge.id]?.[index] || [];
              const showAll = showAllReflections[challenge.id]?.[index];

              return (
                <div key={`${challenge.id}-week-${index}`} className="period-prompt">
                  <h5>Week {index + 1} {challenge.start_date && `(${getPeriodDates(challenge.start_date, index)})`}</h5>
                  <p>{prompt}</p>

                  {weekReflections.length > 0 && (
                    <div className="weekly-reflections">
                      <h6 className="reflections-header">
                        <FaList /> Reflections this week
                        <button 
                          onClick={() => toggleShowAllReflections(challenge.id, index)}
                          className="toggle-reflections-button"
                        >
                          {showAll ? 'Show Less' : `Show All (${weekReflections.length})`}
                        </button>
                      </h6>
                      {(showAll ? weekReflections : weekReflections.slice(-1)).map((entry, idx) => (
                        <div key={idx} className="reflection-entry">
                          <small className="reflection-date">
                            {moment(entry.timestamp).format('MMM D, YYYY h:mm A')}
                          </small>
                          <p className="reflection-text">{entry.reflection}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {(isCompleted || index <= progress.findIndex(p => p !== 'completed')) && (
                    <div className="new-reflection-section">
                      <textarea 
                        placeholder="Share your reflection (2-4 sentences)..."
                        value={reflections[challenge.id]?.[index] || ''}
                        onChange={(e) => handleReflectionChange(challenge.id, index, e.target.value)}
                        className="reflection-input"
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
                          onClick={() => {
                            if (isGroupChallenge) {
                              handlePeriodUpdate(
                                challenge.id,
                                index,
                                reflections[challenge.id]?.[index] || '',
                                !isCompleted,
                                isCompleted
                              );
                            } else if (isCustomGoal) {
                              onPersonalGoalUpdate(
                                challenge.id,
                                index,
                                reflections[challenge.id]?.[index] || '',
                                !isCompleted,
                                isCompleted
                              );
                            } else {
                              handlePeriodUpdate(
                                challenge.id,
                                index,
                                reflections[challenge.id]?.[index] || '',
                                !isCompleted,
                                isCompleted
                              );
                            }
                          }}
                          className={`check-in-button ${isCompleted ? 'additional-reflection' : ''}`}
                          disabled={loading[challenge.id]}
                        >
                          {loading[challenge.id] ? (
                            <>
                              <FaSpinner className="fa-spin" /> Loading...
                            </>
                          ) : (
                            <>
                              {isCompleted ? (
                                <>
                                  <FaPlusCircle /> Add Another Reflection
                                </>
                              ) : (
                                <>
                                  <FaCalendarCheck /> Check-in
                                </>
                              )}
                            </>
                          )}
                        </button>
                      )}
                      {isGroupChallenge && (
                        <div className="group-challenge-info">
                          <small>
                            <FaUsers /> Group challenge for {groupNames[challenge.group_id]}
                          </small>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const processAndGroupChallenges = () => {
    console.log('==================== Processing Challenges ====================');

    try {
      const groupChallenges = challenges.filter(c => c.group_id);
      console.log('Identified group challenges:', groupChallenges);

      const enrichedGroupChallenges = groupChallenges.map(challenge => ({
        ...challenge,
        isGroupChallenge: true,
        category: 'Group Challenges',
        title: challenge.title || challenge.description,
        group_name: groupNames[challenge.group_id] || 'Group Challenge'
      }));

      const regularChallenges = challenges.filter(c => !c.group_id);
      console.log('Regular challenges:', regularChallenges);
      
      const filteredRegularChallenges = regularChallenges.filter(challenge => 
        challenge.category !== 'Custom' || !personalGoals.some(goal => goal.id === challenge.id)
      );

      const allChallenges = [...enrichedGroupChallenges, ...filteredRegularChallenges, ...personalGoals];

      const grouped = allChallenges.reduce((acc, challenge) => {
        const category = challenge.isGroupChallenge ? 'Group Challenges' : challenge.category;

        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(challenge);
        return acc;
      }, {});

      console.log('Final grouped challenges:', grouped);
      return grouped;
    } catch (error) {
      console.error('Error processing challenges:', error);
      return {
        'General Challenges': challenges
      };
    }
  };

  const groupedChallenges = processAndGroupChallenges();  

  return (
    <div className="challenges-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <FaChartLine className="dashboard-icon" />
          <h2>Your Faith Journey Activities</h2>
        </div>
        {(!challenges?.length && !personalGoals?.length) ? (
          <div className="empty-challenges-message">
            <p>Select your first faith activity below to begin your journey.</p>
            <div className="empty-challenges-divider"></div>
          </div>
        ) : null}
      </div>
      <div className="categories-container">
        {groupedChallenges['Group Challenges']?.length > 0 && (
          <div key="Group Challenges" className="category-section">
            <h3><FaUsers /> Group Activites</h3>
            <div className="challenges-list">
              {groupedChallenges['Group Challenges'].map(challenge => renderChallenge(challenge))}
            </div>
          </div>
        )}
        
        {Object.entries(groupedChallenges)
          .filter(([category]) => category !== 'Group Challenges')
          .map(([category, categoryChallenges]) => (
            <div key={category} className="category-section">
              <h3>
                <FaTasks /> {category}
                {category !== 'General Challenges' && (
                  <p className="category-level">Level: {userLevels[category] || 'Custom Goal'}</p>
                )}
              </h3>
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