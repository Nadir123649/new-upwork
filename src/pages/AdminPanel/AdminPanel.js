import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navbar/Navbar';
import { 
  FaCog, 
  FaTrophy, 
  FaComments, 
  FaUsers, 
  FaCoins, 
  FaLock, 
  FaGlobe, 
  FaUserPlus, 
  FaUserMinus, 
  FaLightbulb,
  FaChevronRight
} from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';
import './AdminPanel.css';

const AdminPanel = ({ groupId }) => {
  const userId = useSelector(state => state.user.userId);
  const [currentChatOverride, setCurrentChatOverride] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [leaderPoints, setLeaderPoints] = useState(0);
  const [activeTab, setActiveTab] = useState('general');
  const [isPublic, setIsPublic] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [customChallengeTitle, setCustomChallengeTitle] = useState('');
  const [weeklyPrompts, setWeeklyPrompts] = useState(['', '', '', '']);
  const [samplePrompts, setSamplePrompts] = useState([
    { title: '', description: '' },
    { title: '', description: '' },
    { title: '', description: '' }
  ]);
  const [chatInstructions, setChatInstructions] = useState({
    overview: '',
    openingInstructions: '',
    readingConnectionInstructions: '',
    spiritualGuidanceInstructions: '',
    challengeProgressInstructions: '',
    personalGrowthInstructions: '',
    questionInstructions: '',
    actionStepInstructions: '',
    recommendedPromptsInstructions: '',
  });

  useEffect(() => {
    fetchGroupSettings();
    fetchPendingRequests();
    fetchCurrentChatOverride();
    fetchCurrentSamplePrompts();
  }, [groupId, userId]);

  // Add this near the top with your other useEffect hooks
  useEffect(() => {
    // Log initial size
    console.log(`Initial window width: ${window.innerWidth}px`);
    console.log(`Initial window height: ${window.innerHeight}px`);

    // Add resize listener
    const handleResize = () => {
      console.log(`Window width: ${window.innerWidth}px`);
      console.log(`Window height: ${window.innerHeight}px`);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);










  const fetchCurrentSamplePrompts = async () => {
    try {
      const url = API_ENDPOINTS.GET_GROUP_SAMPLE_PROMPTS.replace(':groupId', groupId);
      console.log('Fetching sample prompts from:', url);
      const response = await axios.get(url);
      const fetchedPrompts = response.data.prompts;
      
      const filledPrompts = [
        ...fetchedPrompts,
        ...Array(3 - fetchedPrompts.length).fill({ title: '', description: '' })
      ].slice(0, 3);
      
      setSamplePrompts(filledPrompts);
    } catch (error) {
      console.error('Error fetching sample prompts:', error);
    }
  };

  const fetchCurrentChatOverride = async () => {
    try {
      const url = API_ENDPOINTS.GET_CHAT_OVERRIDE.replace(':groupId', groupId);
      console.log('Fetching chat override from:', url);
      const response = await axios.get(url);
      setCurrentChatOverride(response.data.chat_override);
      
      // Parse the existing override to populate the form fields
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(response.data.chat_override, "text/xml");
        
        setChatInstructions({
          overview: xmlDoc.querySelector('overview')?.textContent || '',
          openingInstructions: xmlDoc.querySelector('opening')?.textContent || '',
          readingConnectionInstructions: xmlDoc.querySelector('readingConnection')?.textContent || '',
          spiritualGuidanceInstructions: xmlDoc.querySelector('spiritualGuidance')?.textContent || '',
          challengeProgressInstructions: xmlDoc.querySelector('challengeProgress')?.textContent || '',
          personalGrowthInstructions: xmlDoc.querySelector('personalGrowth')?.textContent || '',
          questionInstructions: xmlDoc.querySelector('question')?.textContent || '',
          actionStepInstructions: xmlDoc.querySelector('actionStep')?.textContent || '',
          recommendedPromptsInstructions: xmlDoc.querySelector('recommendedPrompts')?.textContent || '',
        });
      } catch (parseError) {
        console.error('Error parsing XML:', parseError);
      }
    } catch (error) {
      console.error('Error fetching current chat override:', error);
    }
  };

  const fetchGroupSettings = async () => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.GET_GROUP_SETTINGS.replace(':groupId', groupId)
      );
      setIsPublic(response.data.isPublic);
    } catch (error) {
      console.error('Error fetching group settings:', error);
    }
  };

  const handleChatOverrideSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedOverride = `
      ${chatInstructions.overview}

      <reflection>
          <opening>
          ${chatInstructions.openingInstructions}
          </opening>
          <content>
              <readingConnection>
              ${chatInstructions.readingConnectionInstructions}
              </readingConnection>
              <spiritualGuidance>
              ${chatInstructions.spiritualGuidanceInstructions}
              </spiritualGuidance>
              <challengeProgress>
              ${chatInstructions.challengeProgressInstructions}
              </challengeProgress>
              <personalGrowth>
              ${chatInstructions.personalGrowthInstructions}
              </personalGrowth>
              <question>
              ${chatInstructions.questionInstructions}
              </question>
              <actionStep>
              ${chatInstructions.actionStepInstructions}
              </actionStep>
              <recommendedPrompts>
              ${chatInstructions.recommendedPromptsInstructions}
              </recommendedPrompts>
          </content>
      </reflection>
      `.trim();

      const url = API_ENDPOINTS.UPDATE_GROUP_CHAT_OVERRIDE.replace(':groupId', groupId);
      await axios.put(url, { 
        chat_override: formattedOverride,
        user_id: userId 
      });
      
      alert('Chat override updated successfully');
      fetchCurrentChatOverride();
      
      const pointsResponse = await axios.post(
        API_ENDPOINTS.AWARD_LEADER_POINTS.replace(':userId', userId), 
        { action: 'update_chat_prompt' }
      );
      setLeaderPoints(pointsResponse.data.totalPoints);
    } catch (error) {
      console.error('Error updating chat override:', error);
      alert('Failed to update chat override');
    }
  };

  const handleSamplePromptChange = (index, field, value) => {
    const newPrompts = [...samplePrompts];
    newPrompts[index] = {
      ...newPrompts[index],
      [field]: value
    };
    setSamplePrompts(newPrompts);
  };

  const handleSamplePromptsSubmit = async (e) => {
    e.preventDefault();
    try {
      const validPrompts = samplePrompts.filter(p => p.title && p.description);
      const url = API_ENDPOINTS.UPDATE_GROUP_SAMPLE_PROMPTS.replace(':groupId', groupId);
      
      await axios.post(url, {
        prompts: validPrompts,
        user_id: userId
      });
      
      alert('Sample prompts updated successfully');
      fetchCurrentSamplePrompts();
      
      const pointsResponse = await axios.post(
        API_ENDPOINTS.AWARD_LEADER_POINTS.replace(':userId', userId), 
        { action: 'update_sample_prompts' }
      );
      setLeaderPoints(pointsResponse.data.totalPoints);
    } catch (error) {
      console.error('Error updating sample prompts:', error);
      alert('Failed to update sample prompts');
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.GROUPS}/${groupId}/pending-requests`);
      setPendingRequests(response.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleCustomChallengeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(API_ENDPOINTS.CREATE_CUSTOM_GROUP_CHALLENGE.replace(':groupId', groupId), {
        title: customChallengeTitle,
        weeklyPrompts: weeklyPrompts,
        user_id: userId
      });
      
      console.log('Custom challenge response:', response.data);
      alert('Custom challenge created successfully');
      
      setCustomChallengeTitle('');
      setWeeklyPrompts(['', '', '', '']);
      
      if (response.data.points_earned) {
        setLeaderPoints(prevPoints => prevPoints + response.data.points_earned);
      }
    } catch (error) {
      console.error('Error creating custom challenge:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to create custom challenge. Please try again.');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ENDPOINTS.GROUPS}/${groupId}/invite`, { email: memberEmail });
      alert('Invitation sent successfully');
      setMemberEmail('');
      const pointsResponse = await axios.post(`${API_ENDPOINTS.LEADER_POINTS}/${userId}`, { action: 'invite_member' });
      setLeaderPoints(pointsResponse.data.totalPoints);
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const handlePrivacyToggle = async () => {
    try {
      await axios.put(`${API_ENDPOINTS.GROUPS}/${groupId}/privacy`, { isPublic: !isPublic });
      setIsPublic(!isPublic);
      alert('Group privacy setting updated successfully');
    } catch (error) {
      console.error('Error updating group privacy:', error);
    }
  };

  const handleMemberRequest = async (requestId, approve) => {
    try {
      await axios.post(`${API_ENDPOINTS.GROUPS}/${groupId}/member-request`, { requestId, approve });
      fetchPendingRequests();
      alert(`Member request ${approve ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error handling member request:', error);
    }
  };

  const handleWeeklyPromptChange = (index, value) => {
    const newPrompts = [...weeklyPrompts];
    newPrompts[index] = value;
    setWeeklyPrompts(newPrompts);
  };

  const tabs = [
    { id: 'general', icon: FaCog, label: 'Customize AI Responses' },
    { id: 'challenges', icon: FaTrophy, label: 'Challenges' },
    { id: 'members', icon: FaUsers, label: 'Members Management' }
  ];

  return (
    <div className="admin-panel-container">
      <Header />
      <div className="admin-panel-content">
        <Navbar />
        <div className="admin-panel-main">
          <div className="admin-header">
            <h2><FaCog /> Admin Panel</h2>
            <div className="admin-breadcrumb">
              <span>Dashboard</span>
              <FaChevronRight />
              <span>{tabs.find(tab => tab.id === activeTab)?.label}</span>
            </div>
          </div>

          <div className="admin-layout">
            <div className="admin-sidebar">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`admin-nav-button ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <tab.icon />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="admin-main-content">
              {activeTab === 'general' && (
                <div className="admin-section">
                  <div className="admin-card instruction-card">
                    <h3><FaComments /> Instructions For Spiritual Direction</h3>
                    <form onSubmit={handleChatOverrideSubmit} className="chat-override-form">
                      <div className="instruction-section">
                        <h4>Reading Connection Instructions</h4>
                        <p className="instruction-description">
                          Specify how to connect scripture or spiritual readings to the user's situation.
                        </p>
                        <textarea
                          value={chatInstructions.readingConnectionInstructions}
                          onChange={(e) => setChatInstructions(prev => ({
                            ...prev,
                            readingConnectionInstructions: e.target.value
                          }))}
                          placeholder="Enter instructions for reading connections..."
                          className="instruction-input"
                        />
                      </div>

                      <div className="instruction-section">
                        <h4>Spiritual Guidance Instructions</h4>
                        <p className="instruction-description">
                          Specify how to connect scripture or spiritual readings to the user's situation.
                        </p>

                        <textarea
                          value={chatInstructions.spiritualGuidanceInstructions}
                          onChange={(e) => setChatInstructions(prev => ({
                            ...prev,
                            spiritualGuidanceInstructions: e.target.value
                          }))}
                          placeholder="Enter instructions for spiritual guidance..."
                          className="instruction-input"
                        />
                      </div>

                      <div className="instruction-section">
                        <h4>Action Step Instructions</h4>
                        <p className="instruction-description">
                          Specify how to connect scripture or spiritual readings to the user's situation.
                        </p>
                        <textarea
                          value={chatInstructions.actionStepInstructions}
                          onChange={(e) => setChatInstructions(prev => ({
                            ...prev,
                            actionStepInstructions: e.target.value
                          }))}
                          placeholder="Enter instructions for suggesting action steps..."
                          className="instruction-input"
                        />
                      </div>

                      <button type="submit" className="primary-button">
                        Update Chat Override
                      </button>
                    </form>

                    {currentChatOverride && (
                      <div className="current-override">
                        <h4>Current Instructions</h4>
                        <div className="override-display">
                          {currentChatOverride}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="admin-card">
                    <h3><FaLightbulb /> Sample Prompts</h3>
                    <form onSubmit={handleSamplePromptsSubmit} className="sample-prompts-form">
                      <div className="prompt-description">
                        Configure up to 3 sample prompts that group members can see in their chat
                      </div>
                      {samplePrompts.map((prompt, index) => (
                        <div key={index} className="sample-prompt-input">
                          <div className="prompt-header">
                            <div className="prompt-number">Prompt {index + 1}</div>
                          </div>
                          <input
                            type="text"
                            value={prompt.title}
                            onChange={(e) => handleSamplePromptChange(index, 'title', e.target.value)}
                            placeholder={`Enter prompt ${index + 1} title`}
                            className="sample-prompt-title"
                          />
                          <textarea
                            value={prompt.description}
                            onChange={(e) => handleSamplePromptChange(index, 'description', e.target.value)}
                            placeholder={`Enter detailed description for prompt ${index + 1}`}
                            className="sample-prompt-description"
                          />
                        </div>
                      ))}
                      <button type="submit" className="primary-button">
                        <FaLightbulb /> Update Sample Prompts
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'challenges' && (
                <div className="admin-section">
                  <div className="admin-card">
                    <h3><FaTrophy /> Create New Challenge</h3>
                    <form onSubmit={handleCustomChallengeSubmit} className="challenge-form">
                      <div className="form-group">
                        <label>Challenge Title</label>
                        <input
                          type="text"
                          value={customChallengeTitle}
                          onChange={(e) => setCustomChallengeTitle(e.target.value)}
                          placeholder="Enter challenge title"
                          required
                          className="challenge-title-input"
                        />
                      </div>
                      
                      <div className="weekly-prompts-container">
                        {weeklyPrompts.map((prompt, index) => (
                          <div key={index} className="form-group">
                            <label>Week {index + 1} Prompt</label>
                            <textarea
                              value={prompt}
                              onChange={(e) => handleWeeklyPromptChange(index, e.target.value)}
                              placeholder={`Enter prompt for week ${index + 1}`}
                              required
                              className="weekly-prompt-input"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <button type="submit" className="primary-button">
                        <FaTrophy /> Create Challenge
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="admin-section">
                  <div className="admin-card">
                    <h3><FaUserPlus /> Invite New Member</h3>
                    <div className="feature-unavailable-notice">
                      <FaLock className="lock-icon" />
                      <p>Email invitations are temporarily unavailable.</p>
                      <small>Please check back later or share the group link directly.</small>
                    </div>
                    <form onSubmit={handleInviteMember} className="invite-form disabled">
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          value={memberEmail}
                          onChange={(e) => setMemberEmail(e.target.value)}
                          placeholder="Invitations temporarily disabled"
                          disabled
                          className="email-input disabled"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="primary-button disabled"
                        disabled
                      >
                        <FaUserPlus /> Send Invitation
                      </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

