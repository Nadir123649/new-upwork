import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrophy, FaUserPlus, FaCheckCircle, FaRegCircle, FaUsers } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';
import './GroupChallenges.css';

const GroupChallenges = ({ groupId, userId }) => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participatingChallenges, setParticipatingChallenges] = useState({});
  const [challengeParticipants, setChallengeParticipants] = useState({});

  useEffect(() => {
    console.log('GroupChallenges useEffect triggered with groupId:', groupId);
    fetchGroupChallengesAndParticipation();
  }, [groupId, userId]);

  const fetchChallengeParticipants = async (challengeId) => {
    try {
      const participantsUrl = `${API_ENDPOINTS.GROUP_CHALLENGE_PARTICIPANTS
        .replace(':groupId', groupId)
        .replace(':challengeId', challengeId)}`;
      
      const response = await axios.get(participantsUrl);
      setChallengeParticipants(prev => ({
        ...prev,
        [challengeId]: response.data
      }));
      return response.data;
    } catch (error) {
      console.error(`Error fetching participants for challenge ${challengeId}:`, error);
      return [];
    }
  };

  const fetchGroupChallengesAndParticipation = async () => {
    setLoading(true);
    try {
      const url = API_ENDPOINTS.GROUP_CHALLENGES_LIST.replace(':groupId', groupId);
      const response = await axios.get(url);
      setChallenges(response.data);

      const participationStatus = {};
      for (const challenge of response.data) {
        const participants = await fetchChallengeParticipants(challenge.id);
        participationStatus[challenge.id] = participants.some(p => p.id === parseInt(userId));
      }
      
      setParticipatingChallenges(participationStatus);
      setError(null);
    } catch (error) {
      console.error('GroupChallenges error fetching data:', error);
      setError('Failed to load challenges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipation = async (challengeId) => {
    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const joinUrl = API_ENDPOINTS.JOIN_GROUP_CHALLENGE
        .replace(':groupId', groupId)
        .replace(':challengeId', challengeId);

      await axios.post(joinUrl, {
        user_id: userId
      });

      await fetchChallengeParticipants(challengeId);
      
      setParticipatingChallenges(prev => ({
        ...prev,
        [challengeId]: true
      }));
    } catch (error) {
      console.error('Error updating challenge participation:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update challenge participation';
      alert(errorMessage);
    }
  };

  const renderParticipants = (challengeId) => {
    const participants = challengeParticipants[challengeId] || [];
    
    return (
      <div className="challenge-participants">
        <div className="participants-header">
          <FaUsers className="participants-icon" />
          <span>Current Participants ({participants.length})</span>
        </div>
        <div className="participants-list">
          {participants.map(participant => (
            <div key={participant.id} className="participant-item">
              <span className="participant-name">{participant.name}</span>
              <div className="participant-progress">
                {participant.period_progress?.map((status, index) => (
                  <span 
                    key={index} 
                    className={`progress-dot ${status === 'completed' ? 'completed' : ''}`}
                    title={`Week ${index + 1}: ${status}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeeklyPrompts = (challenge) => {
    const isParticipating = participatingChallenges[challenge.id];
    
    return (
      <div className="weekly-prompts-container">
        <h4 className="prompts-title">Weekly Prompts</h4>
        <div className="prompts-grid">
          {challenge.weekly_prompts.map((prompt, index) => {
            const status = challenge.period_progress?.[index] === 'completed' ? 'completed' : 'pending';
            return (
              <div key={index} className="prompt-card">
                <div className="prompt-week">Week {index + 1}</div>
                <p className="prompt-text">{prompt}</p>
                {isParticipating && (
                  <div className={`prompt-status ${status}`}>
                    Status: {status === 'completed' ? 'Completed' : 'Pending'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading-message">Loading challenges...</div>;
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">Error: {error}</p>
        <button onClick={fetchGroupChallengesAndParticipation} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="group-challenges">
      <div className="challenges-header">
        <h2><FaTrophy className="trophy-icon" /> Group Challenges</h2>
      </div>

      {challenges.length === 0 ? (
        <p className="no-challenges">No challenges available at the moment.</p>
      ) : (
        <div className="challenges-grid">
          {challenges.map(challenge => (
            <div key={challenge.id} className="challenge-card">
              <div className="challenge-card-header">
                <h3 className="challenge-title">{challenge.title}</h3>
                <div className="challenge-meta">
                  <span className="challenge-date">
                    Created: {new Date(challenge.created_at).toLocaleDateString()}
                  </span>
                  {participatingChallenges[challenge.id] ? (
                    <div className="participating-badge">
                      <FaCheckCircle className="text-green-500" />
                      <span>Participating</span>
                    </div>
                  ) : (
                    <button 
                      className="participation-button"
                      onClick={() => handleParticipation(challenge.id)}
                    >
                      <FaUserPlus /> Join Challenge
                    </button>
                  )}
                </div>
              </div>

              {challenge.description && (
                <p className="challenge-description">{challenge.description}</p>
              )}

              {renderParticipants(challenge.id)}

              {challenge.weekly_prompts && challenge.weekly_prompts.length > 0 && 
                renderWeeklyPrompts(challenge)
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupChallenges;