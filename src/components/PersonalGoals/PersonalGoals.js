import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import './PersonalGoals.css';

const PersonalGoals = ({ userId, onGoalAdded }) => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const [newGoalPrompts, setNewGoalPrompts] = useState(['', '', '', '']);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.GOALS}/${userId}`);
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching personal goals:', error);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_ENDPOINTS.GOALS}/${userId}`, {
        description: newGoal,
        category: newGoalCategory,
        weekly_prompts: newGoalPrompts
      });
      setNewGoal('');
      setNewGoalCategory('');
      setNewGoalPrompts(['', '', '', '']);
      fetchGoals();
      if (onGoalAdded) {
        onGoalAdded(response.data);
      }
    } catch (error) {
      console.error('Error submitting goal:', error);
    }
  };

  const handleProgressUpdate = async (goalId, progress) => {
    try {
      await axios.put(`${API_ENDPOINTS.GOALS}/${userId}`, {
        goal_id: goalId,
        progress
      });
      fetchGoals();
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  return (
    <div className="personal-goals">
      <h2>Custom 4-Week Spiritual Goals</h2>
      <form onSubmit={handleGoalSubmit}>
        <input
          type="text"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          placeholder="Enter a new 4-week spiritual goal..."
          required
        />
        <select
          value={newGoalCategory}
          onChange={(e) => setNewGoalCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          <option value="Personal Devotion">Personal Devotion</option>
          <option value="Community Engagement">Community Engagement</option>
          <option value="Spiritual Study">Spiritual Study</option>
          <option value="Faith in Action">Faith in Action</option>
        </select>
        {newGoalPrompts.map((prompt, index) => (
          <input
            key={index}
            type="text"
            value={prompt}
            onChange={(e) => {
              const updatedPrompts = [...newGoalPrompts];
              updatedPrompts[index] = e.target.value;
              setNewGoalPrompts(updatedPrompts);
            }}
            placeholder={`Week ${index + 1} prompt`}
            required
          />
        ))}
        <button type="submit">Add Custom 4-Week Goal</button>
      </form>
      <div className="goals-list">
        {goals.map(goal => (
          <div key={goal.id} className="goal-card">
            <h3>{goal.description}</h3>
            <p>Category: {goal.category}</p>
            <h4>Weekly Prompts:</h4>
            <ul>
              {goal.weekly_prompts.map((prompt, index) => (
                <li key={index}>{prompt}</li>
              ))}
            </ul>
            <input
              type="range"
              min="0"
              max="100"
              value={goal.progress || 0}
              onChange={(e) => handleProgressUpdate(goal.id, e.target.value)}
            />
            <span>{goal.progress || 0}% Complete</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalGoals;