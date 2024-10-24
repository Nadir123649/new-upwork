import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import "./Profile.css";
import Header from "../../components/Header/Header";
import Navbar from "../../components/Navbar/Navbar";
import { API_ENDPOINTS } from '../../config/api';

const Profile = () => {
  const [personalData, setPersonalData] = useState("");
  const [professionalData, setProfessionalData] = useState("");
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState('');
  const [faithJourneySummary, setFaithJourneySummary] = useState({});
  const { userId, isAuthorized } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthorized) {
      navigate('/signin');
      return;
    }
    const fetchUserProfile = async () => {
      try {
        const [profileResponse, pointsResponse, faithTreeResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.USER_PROFILE}/${userId}`),
          axios.get(`${API_ENDPOINTS.USER_POINTS}/${userId}`),
          axios.get(`${API_ENDPOINTS.FAITH_TREE}/${userId}`)
        ]);
        
        setPersonalData(profileResponse.data.personal || "");
        setProfessionalData(profileResponse.data.professional || "");
        setPoints(pointsResponse.data.points);
        setLevel(pointsResponse.data.level);
        setFaithJourneySummary(faithTreeResponse.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Failed to load user information: ${error.response?.data?.message || error.message}`,
        });
      }
    };
    if (userId) {
      fetchUserProfile();
    }
  }, [userId, isAuthorized, navigate]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const data = {
        personal: personalData,
        professional: professionalData
      };
      
      const response = await axios.post(`${API_ENDPOINTS.UPDATE_USER_PROFILE}/${userId}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Profile information updated successfully",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Failed to update profile information: ${error.response?.data?.message || error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="profile-container">
      <Header />
      <div className="profile-content">
        <Navbar />
        <div className="profile-main">
          <h1 className="profile-title">Your Profile</h1>
          <div className="faith-journey-summary">
            <h2>Faith Journey Summary</h2>
            <p><strong>Points:</strong> {points}</p>
            <p><strong>Level:</strong> {level}</p>
            <h3>Progress:</h3>
            <ul>
              <li>Spiritual Direction: {faithJourneySummary['Spiritual Direction'] || 0}</li>
              <li>Faith and Work Integration: {faithJourneySummary['Faith and Work Integration'] || 0}</li>
              <li>Prayer, Sacraments, and Community: {faithJourneySummary['Prayer, Sacraments, and Community'] || 0}</li>
            </ul>
          </div>
          <form className="profile-form" onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
            <div className="label-input">
              <label htmlFor="personal">Personal Background</label>
              <textarea
                id="personal"
                value={personalData}
                onChange={(e) => setPersonalData(e.target.value)}
                placeholder="Describe your personal background"
              />
            </div>
            <div className="label-input">
              <label htmlFor="professional">Professional Background</label>
              <textarea
                id="professional"
                value={professionalData}
                onChange={(e) => setProfessionalData(e.target.value)}
                placeholder="Describe your professional background"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="profile-update-btn"
            >
              {loading ? "Saving..." : "Save Updates"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;