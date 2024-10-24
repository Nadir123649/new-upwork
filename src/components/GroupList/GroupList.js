import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaUsers, FaPlus } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';

const GroupList = ({ userId }) => {
  const [userGroups, setUserGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserGroups = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.USER_GROUPS}/${userId}`);
        setUserGroups(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user groups:', error);
        setIsLoading(false);
      }
    };

    fetchUserGroups();
  }, [userId]);

  if (isLoading) {
    return <div>Loading groups...</div>;
  }

  return (
    <div className="group-list">
      <h3><FaUsers /> Your Groups</h3>
      {userGroups.length > 0 ? (
        <ul>
          {userGroups.map(group => (
            <li key={group.id}>
              <Link to={`/group/${group.id}`}>{group.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <div>
          <p>You're not a member of any groups yet.</p>
          <Link to="/group-directory" className="join-group-link">
            <FaPlus /> Join a Group
          </Link>
        </div>
      )}
    </div>
  );
};

export default GroupList;