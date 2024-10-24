import React from 'react';
import { Link } from 'react-router-dom';

const PromptLimit = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="prompt-limit-overlay">
      <div className="prompt-limit-content">
        <button className="prompt-limit-close" onClick={onClose}>×</button>
        <h2>Guest Limit Reached</h2>
        <p>
          Please <Link to="/signup">register</Link> an account to receive 3 reflections per day (or $20/month for unlimited access).
        </p>
      </div>
    </div>
  );
};

export default PromptLimit;