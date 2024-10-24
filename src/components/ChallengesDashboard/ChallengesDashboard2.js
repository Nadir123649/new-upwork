import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
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
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ description: '', category: '', periodPrompts: ['', '', '', ''] });

  useEffect(() => {
    console.log('ChallengesDashboard received challenges:', challenges);
    console.log('ChallengesDashboard received personal goals:', personalGoals);
    console.log('ChallengesDashboard received userLevels:', userLevels);

    personalGoals.forEach(goal => {
      console.log(`Personal goal: id=${goal.id}, description=${goal.description}`);
    });
  }, [challenges, personalGoals, userLevels]);

  const handlePeriodUpdate = async (challengeId, periodIndex, reflection, completed, goalType) => {
    try {
      const reflectionText = reflection || reflections[challengeId]?.[periodIndex] || '';
      if (!reflectionText.trim()) {
        alert("Please provide a reflection before checking in.");
        return;
      }

      let endpoint;
      let payload;

      if (goalType === 'personal-goal') {
        endpoint = `${API_ENDPOINTS.CHECK_IN_PERSONAL_GOAL}/${userId}`;
        payload = {
          goal_id: challengeId,
          period_index: periodIndex,
          reflection: reflectionText,
          completed: completed
        };
      } else {
        endpoint = `${API_ENDPOINTS.CHECK_IN_CHALLENGE}/${userId}`;
        payload = {
          challenge_id: challengeId,
          period_index: periodIndex,
          reflection: reflectionText,
          completed: completed
        };
      }

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

      if (response.data.challengeCompleted || response.data.goalCompleted) {
        alert('Challenge/Goal completed! Please review and select your next challenge.');
        onInitiateNextChallenges();
      } else {
        alert('Check-in successful!');
      }

      if (goalType === 'personal-goal') {
        onPersonalGoalUpdate(challengeId, periodIndex, reflectionText, completed);
      } else {
        onChallengeUpdate(challengeId, periodIndex, reflectionText, completed);
      }

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

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_ENDPOINTS.GOALS}/${userId}`, {
        description: newGoal.description,
        category: newGoal.category,
        weekly_prompts: newGoal.periodPrompts,
      });
      console.log('New goal added:', response.data);
      setShowAddGoalForm(false);
      setNewGoal({ description: '', category: '', periodPrompts: ['', '', '', ''] });
      onPersonalGoalUpdate();
    } catch (error) {
      console.error('Error adding new goal:', error);
      alert('Failed to add new goal. Please try again.');
    }
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

  const renderChallenge = (challenge) => {
    const prompts = challenge.period_prompts || challenge.weekly_prompts || Array(4).fill("Reflect on your progress this week");
    const progress = challenge.period_progress || challenge.weekly_progress || Array(4).fill('not_started');

    const isTitleLong = challenge.description.length > 17;


    return (
      <div key={challenge.id} className="challenge-card">
        <h4 className={isTitleLong ? 'long-title' : ''}>
          {challenge.description}
        </h4>
        <p className="challenge-type">{challenge.category} {challenge.goalType === 'faith-challenge' ? 'Challenge' : 'Goal'}</p>
        <div className="challenge-progress">
          <div className="progress-bar" style={{ width: `${getProgressPercentage(challenge)}%` }}></div>
        </div>
        <p className="progress-text">Progress: {getProgressPercentage(challenge).toFixed(0)}%</p>
        <button onClick={() => toggleExpandChallenge(challenge.id)} className="expand-button">
          {expandedChallenge === challenge.id ? 'Hide Details' : 'Show Details'}
        </button>
        {expandedChallenge === challenge.id && (
          <div className="challenge-details">
            {prompts.map((prompt, index) => {
              const isCompleted = progress[index] === 'completed';
              if (isCompleted) return null;

              return (
                <div key={index} className="period-prompt">
                  <h5>Week {index + 1} {challenge.start_date && `(${getPeriodDates(challenge.start_date, index)})`}</h5>
                  <p>{prompt}</p>
                  <textarea 
                    placeholder="Share your reflection (2-4 sentences)..."
                    value={reflections[challenge.id]?.[index] || ''}
                    onChange={(e) => handleReflectionChange(challenge.id, index, e.target.value)}
                  />
                  <button 
                    onClick={() => handlePeriodUpdate(challenge.id, index, reflections[challenge.id]?.[index], true, challenge.goalType)}
                    className="check-in-button"
                  >
                    Check-in
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderAddGoalForm = () => (
    <div className="add-goal-form">
      <h3>Add Custom Goal</h3>
      <form onSubmit={handleAddGoal}>
        <input
          type="text"
          value={newGoal.description}
          onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
          placeholder="Enter a new spiritual goal..."
          required
        />
        <select
          value={newGoal.category}
          onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
          required
        >
          <option value="">Select a category</option>
          <option value="Sacramental Life">Sacramental Life</option>
          <option value="Prayer and Scripture">Prayer and Scripture</option>
          <option value="Community and Evangelization">Community and Evangelization</option>
        </select>
        {newGoal.periodPrompts.map((prompt, index) => (
          <input
            key={index}
            type="text"
            value={prompt}
            onChange={(e) => {
              const updatedPrompts = [...newGoal.periodPrompts];
              updatedPrompts[index] = e.target.value;
              setNewGoal({...newGoal, periodPrompts: updatedPrompts});
            }}
            placeholder={`Week ${index + 1} prompt`}
            required
          />
        ))}
        <div className="form-actions">
          <button type="submit">Add Goal</button>
          <button type="button" onClick={() => setShowAddGoalForm(false)}>Cancel</button>
        </div>
      </form>
    </div>
  );

  const allChallenges = [
    ...personalGoals.map(goal => ({ ...goal, goalType: 'personal-goal' })),
    ...challenges.map(challenge => ({ ...challenge, goalType: 'faith-challenge' }))
  ];

  const groupedChallenges = allChallenges.reduce((acc, challenge) => {
    if (!acc[challenge.category]) {
      acc[challenge.category] = [];
    }
    const existingIndex = acc[challenge.category].findIndex(item => item.description === challenge.description);
    if (existingIndex === -1) {
      acc[challenge.category].push(challenge);
    } else if (challenge.goalType === 'personal-goal') {
      acc[challenge.category][existingIndex] = challenge;
    }
    return acc;
  }, {});

  return (
    <div className="challenges-dashboard">
      <h2>Your Faith Journey Challenges</h2>
      {allChallenges.length < 3 && (
        <button 
          className="add-personal-goal-button"
          onClick={() => setShowAddGoalForm(true)}
        >
          Add Personal Goal
        </button>
      )}
      {showAddGoalForm && renderAddGoalForm()}
      <div className="categories-container">
        {Object.entries(groupedChallenges).map(([category, categoryChallenges]) => (
          <div key={category} className="category-section">
            <h3>{category}</h3>
            <p className="category-level">Level: {userLevels[category] || 'Not set'}</p>
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