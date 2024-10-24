import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPencilAlt, FaBook, FaTimes, FaPaperPlane, FaUsers } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';
import './Reflections.css';

const Reflections = ({ userId }) => {
  const [reflections, setReflections] = useState([]);
  const [newReflection, setNewReflection] = useState({ title: '', content: '' });
  const [selectedReflection, setSelectedReflection] = useState(null);

  useEffect(() => {
    fetchAllReflections();
  }, [userId]);

  const fetchAllReflections = async () => {
    try {
      const [personalResponse, groupResponse] = await Promise.all([
        axios.get(`${API_ENDPOINTS.REFLECTIONS}/${userId}`),
        axios.get(API_ENDPOINTS.ALL_REFLECTIONS.replace(':userId', userId))
      ]);
      
      const personalReflections = personalResponse.data.map(reflection => ({ ...reflection, isGroupReflection: false }));
      const groupReflections = groupResponse.data.filter(reflection => reflection.is_group_reflection);
      
      setReflections([...personalReflections, ...groupReflections]);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    }
  };

  const handleSubmitReflection = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ENDPOINTS.REFLECTIONS}/${userId}`, newReflection);
      setNewReflection({ title: '', content: '' });
      fetchAllReflections();
    } catch (error) {
      console.error('Error submitting reflection:', error);
    }
  };

  const handleReflectionClick = (reflection) => {
    setSelectedReflection(reflection);
  };

  return (
    <div className="reflections-container">
      <h2><FaBook /> Your Reflections</h2>
      <p className="reflections-description">
        Reflections are incorporated into your spiritual direction chat, allowing you to discuss specific reflections in the context of your spiritual journey.
      </p>
      <form onSubmit={handleSubmitReflection} className="new-reflection-form">
        <input
          type="text"
          placeholder="Reflection Title"
          value={newReflection.title}
          onChange={(e) => setNewReflection({ ...newReflection, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Your Reflection"
          value={newReflection.content}
          onChange={(e) => setNewReflection({ ...newReflection, content: e.target.value })}
          required
        ></textarea>
        <button type="submit"><FaPaperPlane /> Submit Reflection</button>
      </form>
      <div className="reflections-list">
        {reflections.map((reflection) => (
          <div
            key={reflection.id}
            className="reflection-item"
            onClick={() => handleReflectionClick(reflection)}
          >
            <h3>
              <FaPencilAlt /> {reflection.title}
              {reflection.isGroupReflection && (
                <span className="group-indicator">
                  <FaUsers title="Group Reflection" /> {reflection.group_name}
                </span>
              )}
            </h3>
            <p>{reflection.content.substring(0, 100)}...</p>
          </div>
        ))}
      </div>
      {selectedReflection && (
        <div className="reflection-modal">
          <div className="reflection-modal-content">
            <h3>{selectedReflection.title}</h3>
            <p>{selectedReflection.content}</p>
            {selectedReflection.isGroupReflection && (
              <p className="group-reflection-info">
                <FaUsers /> Group Reflection: {selectedReflection.group_name}
              </p>
            )}
            <button onClick={() => setSelectedReflection(null)}><FaTimes /> Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reflections;