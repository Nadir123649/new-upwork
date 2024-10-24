import React from 'react';

const OnboardingQuestion = ({ questionData, additionalText }) => {
  const renderContent = (content) => {
    return { __html: content };
  };

  if (typeof questionData === 'string') {
    return (
      <div className="onboarding-question">
        <div 
          className="onboarding-question-content"
          dangerouslySetInnerHTML={renderContent(questionData)}
        />
        {additionalText && <div className="additional-text">{additionalText}</div>}
      </div>
    );
  }

  return (
    <div className="onboarding-question">
      {questionData.title && <h2 className="onboarding-question-title">{questionData.title}</h2>}
      <div className="onboarding-question-content">
        {Array.isArray(questionData.content) 
          ? questionData.content.map((paragraph, index) => (
              <p 
                key={index}
                dangerouslySetInnerHTML={renderContent(paragraph)}
              />
            ))
          : <p dangerouslySetInnerHTML={renderContent(questionData.content)} />
        }
      </div>
      {additionalText && <div className="additional-text">{additionalText}</div>}
    </div>
  );
};

export default OnboardingQuestion;