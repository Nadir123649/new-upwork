import React from 'react';
import './SignupPopup.css';
import SignUpForm from '../SignUpForm/SignUpForm';

const SignupPopup = ({ onClose, onSuccess }) => {
  return (
    <div className="signup-popup-overlay">
      <div className="signup-popup">
        <h2>Sign Up for Investing Agent</h2>
        <p>Create an account to access the Investing Agent feature.</p>
        <SignUpForm onSuccess={(userId) => {
          onSuccess(userId);
          onClose();
        }} />
        <button className="signup-popup-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SignupPopup;