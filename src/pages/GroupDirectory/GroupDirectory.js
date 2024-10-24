import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaPlus, 
  FaTimes, 
  FaCog, 
  FaCheck, 
  FaArrowRight,
  FaLock,
  FaGlobe,
  FaSpinner
} from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import './GroupDirectory.css';

const GroupDirectory = () => {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isJoining, setIsJoining] = useState({});
  const userId = useSelector(state => state.user.userId);
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchGroups();
    } else {
      setError("Please log in to view and join groups.");
      setIsLoading(false);
    }
  }, [userId]);

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.GET_PUBLIC_GROUPS}?user_id=${userId}`);
      console.log('Fetched groups:', response.data);
      setGroups(response.data);
      setIsLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError("Unable to load groups. Please try again later.");
      setIsLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    setIsJoining(prev => ({ ...prev, [groupId]: true }));
    try {
      const response = await axios.post(
        API_ENDPOINTS.JOIN_GROUP.replace(':groupId', groupId),
        { user_id: userId }
      );
      console.log('Join response:', response.data);
      // Update the local state to reflect membership
      setGroups(groups.map(group => 
        group.id === groupId 
          ? { ...group, is_member: true }
          : group
      ));
      alert('Successfully joined the group!');
    } catch (error) {
      console.error('Error joining group:', error);
      alert(error.response?.data?.error || 'Failed to join group. Please try again.');
    } finally {
      setIsJoining(prev => ({ ...prev, [groupId]: false }));
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const response = await axios.post(API_ENDPOINTS.CREATE_GROUP, {
        name: newGroupName,
        description: newGroupDescription,
        admin_id: userId,
        is_public: true // Default to public groups
      });
      
      setShowCreateModal(false);
      setNewGroupName('');
      setNewGroupDescription('');
      
      // Refresh the groups list
      await fetchGroups();
      
      alert('Group created successfully!');
    } catch (error) {
      console.error('Error creating group:', error);
      alert(error.response?.data?.error || 'Failed to create group. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToGroupPage = (groupId) => {
    navigate(`/group/${groupId}`);
  };

  const renderGroupCard = (group) => (
    <div key={group.id} className="group-card">
      <div className="group-card-header">
        <h3>{group.name}</h3>
        <div className="group-visibility">
          {group.is_public ? (
            <span className="public-badge">
              <FaGlobe /> Public
            </span>
          ) : (
            <span className="private-badge">
              <FaLock /> Private
            </span>
          )}
        </div>
      </div>

      <p className="group-description">{group.description}</p>

      <div className="group-status">
        {group.is_member && (
          <span className="member-badge">
            <FaCheck /> Member
          </span>
        )}
        {group.is_admin && (
          <span className="admin-badge">
            <FaCog /> Admin
          </span>
        )}
      </div>

      <div className="group-actions">
        {!group.is_member && (
          <button 
            onClick={() => handleJoinGroup(group.id)} 
            className="join-button"
            disabled={isJoining[group.id]}
          >
            {isJoining[group.id] ? (
              <>
                <FaSpinner className="icon-spin" /> Joining...
              </>
            ) : (
              <>
                <FaPlus /> Join Group
              </>
            )}
          </button>
        )}
        
        <button 
          onClick={() => navigateToGroupPage(group.id)} 
          className="view-button"
        >
          <FaArrowRight /> View Group
        </button>

        {group.is_admin && (
          <Link 
            to={`/admin-panel/${group.id}`} 
            className="admin-button"
          >
            <FaCog /> Manage
          </Link>
        )}
      </div>
    </div>
  );

  if (error && !isLoading) {
    return (
      <div className="group-directory-container">
        <Header />
        <div className="group-directory-content">
          <Navbar />
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={fetchGroups} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group-directory-container">
      <Header />
      <div className="group-directory-content">
        <Navbar />
        <div className="group-directory-main">
          <div className="directory-header">
            <div className="header-content">
              <h2><FaUsers /> Faith Groups</h2>
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="create-group-button"
              >
                <FaPlus /> Create New Group
              </button>
            </div>
            <p className="directory-description">
              Join faith groups to share your journey and grow together in community.
            </p>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <FaSpinner className="icon-spin" />
              <p>Loading groups...</p>
            </div>
          ) : (
            <div className="groups-grid">
              {groups.map(renderGroupCard)}
            </div>
          )}

          {showCreateModal && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>Create New Faith Group</h3>
                <form onSubmit={handleCreateGroup}>
                  <div className="form-group">
                    <label>Group Name</label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Enter group name"
                      required
                      maxLength={50}
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      placeholder="Describe your group's purpose and mission"
                      required
                      maxLength={500}
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="create-button">
                      Create Group
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setShowCreateModal(false)}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                <button 
                  onClick={() => setShowCreateModal(false)} 
                  className="close-modal"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDirectory;