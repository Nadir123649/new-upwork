import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { FaQuestionCircle, FaClipboardCheck, FaPlus, FaTasks, FaCheckCircle } from 'react-icons/fa';
import './AssessmentModal.css';

const assessmentQuestions = [
  {
    category: "Sacramental Life",
    questions: [
      "How often do you currently attend Mass?",
      "How frequently do you spend time in Adoration?",
    ]
  },
  {
    category: "Prayer and Scripture",
    questions: [
      "How often do you read Scripture?",
      "Do you have a daily prayer routine? If so, what does it involve?",
    ]
  },
  {
    category: "Community and Evangelization",
    questions: [
      "How often do you attend Catholic events? How frequently do you invite others to attend Catholic events/mass with you?",
      "Explain any settings in which you discuss faith with others.",
    ]
  }
];

const AssessmentModal = ({ onSubmit, onClose, userId }) => {
  const [responses, setResponses] = useState({});
  const [step, setStep] = useState('questions');
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [selectedChallenges, setSelectedChallenges] = useState({});
  const [customGoals, setCustomGoals] = useState([]);
  const [newCustomGoal, setNewCustomGoal] = useState({
    description: '',
    category: 'Custom',
    weekly_prompts: ['', '', '', '']
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (category, questionIndex, value) => {
    setResponses(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [questionIndex]: value
      }
    }));
  };

  const handleSubmitResponses = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Submitting assessment responses for user:', userId);
      const result = await axios.post(`${API_ENDPOINTS.SUBMIT_ASSESSMENT_RESPONSES}/${userId}`, { responses });
      console.log('Assessment submission result:', result.data);
      setAssessmentResult(result.data);
      setStep('selectChallenges');
    } catch (error) {
      console.error('Error submitting assessment:', error.response ? error.response.data : error.message);
      alert('There was an error submitting your assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChallenge = (category, challenge) => {
    setSelectedChallenges(prev => {
      const newSelectedChallenges = { ...prev };

      if (newSelectedChallenges[category]?.description === challenge.description) {
        delete newSelectedChallenges[category];
      } else {
        if (Object.keys(newSelectedChallenges).length + customGoals.length >= 3) {
          alert("You can only have a maximum of 3 active challenges/goals. Please unselect an existing challenge before adding a new one.");
          return prev;
        }
        newSelectedChallenges[category] = challenge;
      }

      return newSelectedChallenges;
    });
  };

  const handleCustomGoalChange = (field, value) => {
    setNewCustomGoal(prev => ({
      ...prev,
      [field]: field === 'weekly_prompts' ? value : value
    }));
  };

  const handleAddCustomGoal = () => {
    if (customGoals.length + Object.keys(selectedChallenges).length >= 3) {
      alert("You can only have a maximum of 3 active challenges/goals.");
      return;
    }
    setCustomGoals([...customGoals, newCustomGoal]);
    setNewCustomGoal({
      description: '',
      category: 'Custom',
      weekly_prompts: ['', '', '', '']
    });
  };
  
  const handleSubmitChallenges = async () => {
    setIsLoading(true);
    try {
      console.log('Submitting selected challenges for user:', userId);
      const formattedSelectedChallenges = Object.entries(selectedChallenges).map(([category, challenge]) => ({
        ...challenge,
        category: category
      }));

      console.log('Challenges to submit:', formattedSelectedChallenges);
      console.log('Custom goals to submit:', customGoals);

      const challengeResult = await axios.post(`${API_ENDPOINTS.SUBMIT_SELECTED_CHALLENGES}/${userId}`, {
        selectedChallenges: [
          ...formattedSelectedChallenges,
          ...customGoals.map(goal => ({
            ...goal,
            category: 'Custom'
          }))
        ]
      });
      console.log('Challenge submission result:', challengeResult.data);

      const assessmentResult = await axios.post(`${API_ENDPOINTS.SUBMIT_ASSESSMENT}/${userId}`, {
        levels: challengeResult.data.levels,
        progress: challengeResult.data.progress
      });
      console.log('Assessment submission result:', assessmentResult.data);

      onSubmit(assessmentResult.data);
      onClose();
    } catch (error) {
      console.error('Error submitting challenges and assessment:', error.response ? error.response.data : error.message);
      alert('There was an error submitting your challenges and assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestions = () => (
    <form onSubmit={handleSubmitResponses} className="assessment-form">
      {assessmentQuestions.map((categoryData, categoryIndex) => (
        <div key={categoryIndex} className="assessment-category">
          <h3><FaQuestionCircle /> {categoryData.category}</h3>
          {categoryData.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="assessment-question">
              <label>{question}</label>
              <textarea
                value={responses[categoryData.category]?.[questionIndex] || ''}
                onChange={(e) => handleInputChange(categoryData.category, questionIndex, e.target.value)}
                required
              />
            </div>
          ))}
        </div>
      ))}
      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Responses'}
      </button>
    </form>
  );

  const renderChallengeSelection = () => (
    <div className="challenge-selection">
      <h2><FaClipboardCheck /> Select Your Challenges</h2>
      <p className="challenge-instructions">Choose up to 3 goals in total: you can select from the suggested challenges or create custom goals. The weekly prompts provide a 4-week schedule of activities. Each week, aim to accomplish one of the items, not necessarily in sequential order.</p>
      {assessmentResult && Object.entries(assessmentResult).map(([category, data]) => (
        <div key={category} className="category-challenges">
          <h3>{category} - Level: {data.level}</h3>
          <div className="challenge-options">
            {data.challenges.map((challenge, index) => (
              <div key={index} className="challenge-option">
                <input
                  type="checkbox"
                  id={`${category}-${index}`}
                  checked={selectedChallenges[category]?.description === challenge.description}
                  onChange={() => handleSelectChallenge(category, challenge)}
                />
                <label htmlFor={`${category}-${index}`}>
                  {challenge.description}
                  <div className="weekly-prompts">
                    Weekly prompts:
                    <ul>
                      {challenge.weekly_prompts.map((prompt, promptIndex) => (
                        <li key={promptIndex}>{prompt}</li>
                      ))}
                    </ul>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="custom-goals-section">
        <h3><FaPlus /> Add Custom Goal</h3>
        <p className="custom-goal-instructions">Use custom goals to incorporate specific professional or personal objectives, such as 'praying for colleagues at work' or 'helping a friend with one of their personal challenges'.</p>
        <input
          type="text"
          value={newCustomGoal.description}
          onChange={(e) => handleCustomGoalChange('description', e.target.value)}
          placeholder="Goal description"
          className="custom-goal-input"
        />
        {newCustomGoal.weekly_prompts.map((prompt, index) => (
          <input
            key={index}
            type="text"
            value={prompt}
            onChange={(e) => {
              const newPrompts = [...newCustomGoal.weekly_prompts];
              newPrompts[index] = e.target.value;
              handleCustomGoalChange('weekly_prompts', newPrompts);
            }}
            placeholder={`Week ${index + 1} prompt`}
            className="custom-goal-input"
          />
        ))}
        <button onClick={handleAddCustomGoal} className="add-custom-goal-button">
          <FaPlus /> Add Custom Goal
        </button>
      </div>
      <div className="selected-goals">
        <h4><FaTasks /> Selected Goals:</h4>
        {Object.entries(selectedChallenges).map(([category, challenge]) => (
          <div key={category} className="selected-goal">
            <FaCheckCircle /> {category}: {challenge.description}
          </div>
        ))}
        {customGoals.map((goal, index) => (
          <div key={index} className="selected-goal">
            <FaCheckCircle /> Custom: {goal.description}
          </div>
        ))}
      </div>
      <button onClick={handleSubmitChallenges} className="submit-button" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Submit Selected Challenges and Goals'}
      </button>
    </div>
  );

  return (
    <div className="assessment-modal">
      <div className="assessment-modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>Faith Journey Assessment</h2>
        {step === 'questions' ? renderQuestions() : renderChallengeSelection()}
      </div>
    </div>
  );
};

export default AssessmentModal;