import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaCoins, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import './ProgressTracker.css';

const ProgressTracker = ({ points, level, completedChallenges, isLoggedIn, assessmentCompleted, isTempUser }) => {
  const getNextLevelPoints = () => {
    if (points < 25) return 25;
    if (points < 100) return 100;
    return null; // No next level for Apostle
  };

  const getProgressToNextLevel = () => {
    if (points < 25) return (points / 25) * 100;
    if (points < 100) return ((points - 25) / 75) * 100;
    return 100; // Full progress for Apostle
  };

  const progressToNextLevel = getProgressToNextLevel();

  const renderLevelContent = () => {
    if (!isLoggedIn) {
      return (
        <Link to="/signup" className="level-link">
          Register & Start Assessment
        </Link>
      );
    } else if (!assessmentCompleted) {
      return <span className="level-text">Start Assessment</span>;
    } else {
      return <span className="level-value">{level}</span>;
    }
  };

  const displayPoints = isTempUser ? 0 : points;

  return (
    <div className="progress-tracker">
      <h2><FaChartLine /> Track Your Progress</h2>
      <div className="progress-stats">
        <div className="stat-item">
          <FaTrophy className="stat-icon" />
          <span className="stat-label">Level</span>
          {renderLevelContent()}
        </div>
        <div className="stat-item">
          <FaCoins className="stat-icon" />
          <span className="stat-label">Points</span>
          <span className="stat-value">{displayPoints}</span>
        </div>
        <div className="stat-item">
          <FaCheckCircle className="stat-icon" />
          <span className="stat-label">Completed Challenges</span>
          <span className="stat-value">{completedChallenges}</span>
        </div>
      </div>
      {isLoggedIn && assessmentCompleted && (
        <div className="level-progress">
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressToNextLevel}%` }}></div>
            <span className="progress-percentage">{progressToNextLevel.toFixed(1)}%</span>
          </div>
          {getNextLevelPoints() !== null ? (
            <p className="next-level-text">Next level at {getNextLevelPoints()} points</p>
          ) : (
            <p className="next-level-text">You've reached the highest level!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;