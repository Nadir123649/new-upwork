import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBook } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';

const GroupReflections = ({ groupId }) => {
  const [reflections, setReflections] = useState([]);
  const [newReflection, setNewReflection] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchGroupReflections();
  }, [groupId]);

  const fetchGroupReflections = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.GROUP_REFLECTIONS}/${groupId}`);
      setReflections(response.data);
    } catch (error) {
      console.error('Error fetching group reflections:', error);
    }
  };

  const handleSubmitReflection = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ENDPOINTS.GROUP_REFLECTIONS}/${groupId}`, newReflection);
      setNewReflection({ title: '', content: '' });
      fetchGroupReflections();
    } catch (error) {
      console.error('Error submitting group reflection:', error);
    }
  };

  return (
    <div className="group-reflections">
      <h2><FaBook /> Group Reflections</h2>
      <form onSubmit={handleSubmitReflection}>
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
        <button type="submit">Submit Reflection</button>
      </form>
      <div className="reflections-list">
        {reflections.map(reflection => (
          <div key={reflection.id} className="reflection-item">
            <h3>{reflection.title}</h3>
            <p>{reflection.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupReflections;