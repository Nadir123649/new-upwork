import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { FaUsers, FaPlus, FaTimes } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';

const GroupDirectory = () => {
  const [publicGroups, setPublicGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const userId = useSelector(state => state.user.userId);

  useEffect(() => {
    fetchPublicGroups();
  }, []);

  const fetchPublicGroups = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PUBLIC_GROUPS);
      setPublicGroups(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching public groups:', error);
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await axios.post(`${API_ENDPOINTS.JOIN_GROUP}/${groupId}`);
      // Update the list of public groups or show a success message
      fetchPublicGroups();
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_ENDPOINTS.CREATE_GROUP, {
        name: newGroupName,
        description: newGroupDescription,
        admin_id: userId
      });
      console.log('Group created:', response.data);
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      fetchPublicGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  if (isLoading) {
    return <div>Loading group directory...</div>;
  }

  return (
    <div className="group-directory">
      <h2><FaUsers /> Group Directory</h2>
      <button onClick={() => setShowCreateModal(true)} className="create-group-button">
        <FaPlus /> Create New Group
      </button>
      {publicGroups.map(group => (
        <div key={group.id} className="group-card">
          <h3>{group.name}</h3>
          <p>{group.description}</p>
          <button onClick={() => handleJoinGroup(group.id)}>
            <FaPlus /> Join Group
          </button>
        </div>
      ))}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Create New Group</h3>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
              />
              <textarea
                placeholder="Group Description"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                required
              />
              <button type="submit">Create Group</button>
            </form>
            <button onClick={() => setShowCreateModal(false)} className="close-modal">
              <FaTimes />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDirectory;