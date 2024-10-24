import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { fetchUserId } from '../../store/actions/userActions';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import { API_ENDPOINTS } from '../../config/api';
import { FaTools, FaExclamationTriangle } from 'react-icons/fa';
import './Build.css';

const Build = () => {
  const { isAuthorized, userId, email } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    projectDescription: '',
    experience: '',
    useCases: ''
  });

  useEffect(() => {
    if (isAuthorized && email && !userId) {
      dispatch(fetchUserId(email));
    }
    setIsLoading(false);
  }, [isAuthorized, email, userId, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthorized) {
      setError('You must be signed in to submit a project.');
      return;
    }

    try {
      const response = await axios.post(`${API_ENDPOINTS.BASE_URL}:5054/builder-info`, {
        userId,
        ...formData
      });
      alert('Project submitted successfully!');
      setFormData({
        fullName: '',
        projectDescription: '',
        experience: '',
        useCases: ''
      });
    } catch (error) {
      setError('Failed to submit project. Please try again.');
      console.error('Error submitting project:', error);
    }
  };

  return (
    <div className="build-container">
      <Header />
      <div className="build-content">
        <Navbar />
        <div className="build-main">
          <section className="build-header">
            <h1>Build with CrossValidation.ai</h1>
          </section>
          <section className="build-description">
            <h2><FaTools /> Build Subscribers Program</h2>
            <p>
              Build subscribers ($100/month) can partner with members in the ecosystem to build consumer widgets for the Catholic AI audience, integrating with offline APIs and data provided by CrossValidation.ai. Users can identify other builders in the ecosystem and, if successfully approved by CrossValidation.ai, offer their widgets on the public site (expected 2Q2025).
            </p>
            <p>
              Concepts that successful widget applications may be approved for include the integration of Catholic spiritual direction reflections or activities into AI agents (e.g., assisting with better adoration reflections, ensuring alignment with financial data and Catholic principles, researching Catholic-aligned generative AI products, etc).
            </p>
          </section>
          <section className="build-form">
            <h2>Submit Your Project Idea</h2>
            {isLoading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error-message"><FaExclamationTriangle /> {error}</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="projectDescription">Project Description</label>
                  <textarea
                    id="projectDescription"
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="experience">Experience or Background</label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="useCases">Possible Use Cases</label>
                  <textarea
                    id="useCases"
                    name="useCases"
                    value={formData.useCases}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <button type="submit" className="submit-button" disabled={!isAuthorized}>
                  Submit Project
                </button>
                {!isAuthorized && (
                  <p className="signin-message">
                    Please <Link to="/signin">sign in</Link> to submit your project.
                  </p>
                )}
              </form>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Build;