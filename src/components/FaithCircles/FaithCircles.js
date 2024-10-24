import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import './FaithCircles.css';

const FaithCircles = ({ userId }) => {
  const [circles, setCircles] = useState([]);
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleDescription, setNewCircleDescription] = useState('');

  useEffect(() => {
    fetchCircles();
  }, []);

  const fetchCircles = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.FAITH_CIRCLES}/${userId}`);
      setCircles(response.data);
    } catch (error) {
      console.error('Error fetching faith circles:', error);
    }
  };

  const handleCircleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ENDPOINTS.FAITH_CIRCLES}/${userId}`, {
        circle_name: newCircleName,
        description: newCircleDescription
      });
      setNewCircleName('');
      setNewCircleDescription('');
      fetchCircles();
    } catch (error) {
      console.error('Error creating faith circle:', error);
    }
  };

  const handleJoinCircle = async (circleId) => {
    try {
      await axios.post(`${API_ENDPOINTS.JOIN_FAITH_CIRCLE}/${userId}/${circleId}`);
      fetchCircles();
    } catch (error) {
      console.error('Error joining faith circle:', error);
    }
  };

  return (
    <div className="faith-circles">
      <h2>Faith Circles</h2>
      <form onSubmit={handleCircleCreate}>
        <input
          type="text"
          value={newCircleName}
          onChange={(e) => setNewCircleName(e.target.value)}
          placeholder="Enter circle name..."
          required
        />
        <textarea
          value={newCircleDescription}
          onChange={(e) => setNewCircleDescription(e.target.value)}
          placeholder="Enter circle description..."
          required
        />
        <button type="submit">Create Circle</button>
      </form>
      <div className="circles-list">
        {circles.map(circle => (
          <div key={circle.id} className="circle-card">
            <h3>{circle.circle_name}</h3>
            <p>{circle.description}</p>
            {!circle.is_member && (
              <button onClick={() => handleJoinCircle(circle.id)}>Join Circle</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaithCircles;