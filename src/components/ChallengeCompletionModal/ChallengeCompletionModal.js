import React, { useState } from 'react';
import './ChallengeCompletionModal.css';

const ChallengeCompletionModal = ({ completedChallenges, onClose, onSelectChallenge }) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [selectedNewChallenge, setSelectedNewChallenge] = useState(null);
  const currentChallenge = completedChallenges[currentChallengeIndex];

  const handleNext = () => {
    if (selectedNewChallenge) {
      onSelectChallenge(currentChallenge.id, selectedNewChallenge);
      setSelectedNewChallenge(null);
      if (currentChallengeIndex < completedChallenges.length - 1) {
        setCurrentChallengeIndex(currentChallengeIndex + 1);
      } else {
        onClose();
      }
    } else {
      alert("Please select a new challenge before proceeding.");
    }
  };

  return (
    <div className="challenge-completion-modal">
      <div className="modal-content">
        <h2>Challenge Completed!</h2>
        <p>Congratulations on completing your {currentChallenge.isMonthly ? 'monthly' : 'weekly'} challenge:</p>
        <h3>{currentChallenge.description}</h3>
        <p>{currentChallenge.message}</p>
        <div className="new-challenges-section">
          <h3>Select your next challenge:</h3>
          {currentChallenge.newChallenges.map((challenge, index) => (
            <div key={index} className="challenge-option">
              <input
                type="radio"
                id={`challenge-${index}`}
                name="new-challenge"
                value={challenge.description}
                checked={selectedNewChallenge === challenge}
                onChange={() => setSelectedNewChallenge(challenge)}
              />
              <label htmlFor={`challenge-${index}`}>
                {challenge.description} ({challenge.isMonthly ? 'Monthly' : 'Weekly'})
              </label>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button onClick={handleNext}>
            {currentChallengeIndex < completedChallenges.length - 1 ? "Next Challenge" : "Finish"}
          </button>
          <button onClick={onClose}>Review Later</button>
        </div>
        <div className="challenge-progress">
          Reviewing challenge {currentChallengeIndex + 1} of {completedChallenges.length}
        </div>
      </div>
    </div>
  );
};

export default ChallengeCompletionModal;