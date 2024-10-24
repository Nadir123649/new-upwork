import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SignUp.css";
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";
import SignUpForm from "../../components/SignUpForm/SignUpForm";

const SignUp = () => {
  const navigate = useNavigate();
  const { referralId } = useParams();

  const handleSignUpSuccess = (userId) => {
    navigate("/chat", { state: { newUser: true, userId: userId } });
  };

  return (
    <div className="signup-container">
      <Header />
      <div className="signup-content">
        <Navbar />
        <div className="signup-main">
          <div className="signup-scroll-container">
            <h1 className="signup-title">Register Your Account</h1>
            <div className="plan-info">
              <h2>Welcome to CrossValidation.ai</h2>
              <p>
                Register for a free account below (by doing so you agree to our{' '}
                <a 
                  href="https://docs.google.com/document/d/1lbq3nwlzCUtoYLNQM94qaiYvVOD1EXS_mNYbp3LQN0o/edit?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  terms and conditions
                </a>.
              </p>
              {referralId && (
                <p className="referral-info">
                  You've been referred by a friend! You'll both receive benefits when you sign up.
                </p>
              )}
            </div>
            <SignUpForm onSuccess={handleSignUpSuccess} referralId={referralId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;