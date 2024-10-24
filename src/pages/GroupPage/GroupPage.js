import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import GroupChallenges from '../../components/GroupChallenges/GroupChallenges';
import AdminPanel from '../../pages/AdminPanel/AdminPanel';
import { FaUsers, FaTrophy, FaCog, FaLock, FaGlobe, FaUserPlus, FaInfoCircle } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';
import './GroupPage.css';

const GroupPage = () => {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('challenges');
  const [members, setMembers] = useState([]);
  const [joinRequestSent, setJoinRequestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = useSelector(state => state.user.userId);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [groupResponse, membersResponse] = await Promise.all([
          axios.get(`${API_ENDPOINTS.GET_GROUPS}?user_id=${userId}`),
          axios.get(API_ENDPOINTS.GROUP_MEMBERS.replace(':groupId', groupId))
        ]);
        const group = groupResponse.data.find(g => g.id === parseInt(groupId));
        if (group) {
          setGroupInfo(group);
          setIsAdmin(group.is_admin);
          setIsMember(group.is_member);
        } else {
          setError('Group not found');
        }
        setMembers(membersResponse.data);
      } catch (error) {
        console.error('Error fetching group data:', error);
        setError('Failed to load group data');
      } finally {
        setIsLoading(false);
      }
    };

    if (groupId && userId) {
      fetchGroupData();
    }
  }, [groupId, userId]);

  const handleJoinGroup = async () => {
    try {
      if (groupInfo.is_public) {
        await axios.post(API_ENDPOINTS.JOIN_GROUP.replace(':groupId', groupId), { user_id: userId });
        setIsMember(true);
      } else {
        await axios.post(API_ENDPOINTS.REQUEST_JOIN_PRIVATE_GROUP.replace(':groupId', groupId), { user_id: userId });
        setJoinRequestSent(true);
      }
    } catch (error) {
      console.error('Error joining/requesting to join group:', error);
      setError('Failed to join group');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'challenges':
        return <GroupChallenges groupId={groupId} userId={userId} key={groupId} />;
      case 'admin':
        return isAdmin ? <AdminPanel groupId={groupId} /> : <p>You don't have admin access.</p>;
      case 'info':
        return (
          <div className="group-info">
            <h2>Group Information</h2>
            <p><strong>Name:</strong> {groupInfo.name}</p>
            <p><strong>Description:</strong> {groupInfo.description}</p>
            <p><strong>Privacy:</strong> {groupInfo.is_public ? 'Public' : 'Private'}</p>
            <p><strong>Members:</strong> {members.length}</p>
          </div>
        );
      default:
        return <GroupChallenges groupId={groupId} userId={userId} key={groupId} />;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!groupInfo) {
    return <div>Group not found</div>;
  }

  return (
    <div className="group-page-container">
      <Header />
      <div className="group-page-content">
        <Navbar />
        <div className="group-page-main">
          <header className="group-header">
            <h1>{groupInfo.name} {groupInfo.is_public ? <FaGlobe title="Public Group" /> : <FaLock title="Private Group" />}</h1>
            <p>{groupInfo.description}</p>
            {!isMember && !joinRequestSent && (
              <button onClick={handleJoinGroup} className="join-group-button">
                <FaUserPlus /> {groupInfo.is_public ? 'Join Group' : 'Request to Join'}
              </button>
            )}
            {joinRequestSent && <p>Join request sent. Waiting for approval.</p>}
          </header>
          {isMember && (
            <>
              <nav className="group-nav">
                <button onClick={() => setActiveTab('challenges')}><FaTrophy /> Challenges</button>
                <button onClick={() => setActiveTab('info')}><FaInfoCircle /> Group Info</button>
                {isAdmin && <button onClick={() => setActiveTab('admin')}><FaCog /> Admin</button>}
              </nav>
              <div className="group-content">
                <main className="group-main">
                  {renderContent()}
                </main>
                <aside className="group-sidebar">
                  <h3>Group Members ({members.length})</h3>
                  <ul className="member-list">
                    {members.map(member => (
                      <li key={member.id} className="member-item">
                        {member.name} {member.is_admin && '(Admin)'}
                      </li>
                    ))}
                  </ul>
                </aside>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupPage;