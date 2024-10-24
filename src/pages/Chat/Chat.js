import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout, fetchUserId, initializeUserId, fetchChatResponseCount, updateLocalChatResponseCount } from '../../store/actions/userActions';
import './Chat.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';
import { API_ENDPOINTS } from '../../config/api';
import { FaPaperPlane, FaLightbulb, FaInfoCircle, FaUsers, FaChevronDown, FaCheck, FaGlobe } from 'react-icons/fa';
import EnhancedSamplePrompt from '../../components/EnhancedSamplePrompt/EnhancedSamplePrompt';
import EnhancedSamplePromptYoungAdult from '../../components/EnhancedSamplePromptYoungAdult/EnhancedSamplePromptYoungAdult';

const Chat = () => {
  const { isAuthorized, userId, tempUserId, email, chatResponseCount, chatResponseLimit, isUnlimited } = useSelector((state) => state.user);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [showLimitCTA, setShowLimitCTA] = useState(false);
  const [isCountLoading, setIsCountLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [primaryGroup, setPrimaryGroup] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState('General');
  const [groupSamplePrompts, setGroupSamplePrompts] = useState([]);
  const chatMessagesWrapperRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const effectiveUserId = userId || tempUserId;

  useEffect(() => {
    if (isAuthorized && email && !userId) {
      dispatch(fetchUserId(email));
    }
  }, [isAuthorized, email, userId, dispatch]);

  useEffect(() => {
    if (!userId) {
      dispatch(initializeUserId());
    }
  }, [userId, dispatch]);

  useEffect(() => {
    const fetchUserGroups = async () => {
      if (effectiveUserId) {
        try {
          const url = `${API_ENDPOINTS.GET_GROUPS}?user_id=${effectiveUserId}`;
          const response = await axios.get(url);
          const memberGroups = response.data.filter(group => group.is_member);
          setUserGroups(memberGroups);
        } catch (error) {
          console.error('Error fetching user groups:', error);
        }
      }
    };
    fetchUserGroups();
  }, [effectiveUserId]);

  useEffect(() => {
    const fetchGroupSamplePrompts = async () => {
      if (selectedGroupId) {
        try {
          const url = API_ENDPOINTS.GET_GROUP_SAMPLE_PROMPTS.replace(':groupId', selectedGroupId);
          const response = await axios.get(url);
          setGroupSamplePrompts(response.data.prompts);
        } catch (error) {
          setGroupSamplePrompts([]);
        }
      } else {
        setGroupSamplePrompts([]);
      }
    };
    fetchGroupSamplePrompts();
  }, [selectedGroupId]);

  useEffect(() => {
    if (effectiveUserId) {
      setIsCountLoading(true);
      dispatch(fetchChatResponseCount(effectiveUserId))
        .then(() => setIsCountLoading(false))
        .catch(() => setIsCountLoading(false));
    }
  }, [effectiveUserId, dispatch]);

  useEffect(() => {
    if (!isCountLoading && !isUnlimited && chatResponseCount !== null && chatResponseLimit !== null) {
      const shouldShowCTA = chatResponseCount >= chatResponseLimit;
      setShowLimitCTA(shouldShowCTA);
    }
  }, [chatResponseCount, chatResponseLimit, isUnlimited, isCountLoading]);

  useEffect(() => {
    if (location.state?.showSuccessPopup) {
      setShowPopup(true);
      setPopupMessage(location.state.message);
      setIsSuccess(true);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setShowPopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const fetchPrimaryGroup = async () => {
      try {
        const url = API_ENDPOINTS.USER_PRIMARY_GROUP.replace(':userId', effectiveUserId);
        const response = await axios.get(url);
        setPrimaryGroup(response.data.group);
      } catch (error) {
        console.error('Error fetching primary group:', error);
      }
    };
    if (effectiveUserId) {
      fetchPrimaryGroup();
    }
  }, [effectiveUserId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSettingsOpen && !event.target.closest('.chat-settings')) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  useEffect(() => {
    if (messages.length || isLoading) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleGroupChange = (groupId) => {
    if (groupId === '') {
      setSelectedGroupId(null);
      setSelectedGroupName('General');
    } else {
      const selectedGroup = userGroups.find(g => g.id.toString() === groupId);
      if (selectedGroup) {
        setSelectedGroupId(Number(groupId));
        setSelectedGroupName(selectedGroup.name);
      }
    }
    setIsSettingsOpen(false);
  };

  const toggleSettings = (e) => {
    e.stopPropagation();
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleResourceSelect = (resourceData) => {
    setSelectedResource(resourceData);
    setSelectedLocation(null);
    // Remove the automatic prompt setting
    // setPrompt(`Tell me about the "${resourceData.resource}" from ${resourceData.orgName}'s ${resourceData.category} category.`);
  };

  const handleLocationSelect = (locationData) => {
    setSelectedLocation(locationData);
    setSelectedResource(null);
    setPrompt(`Tell me about young adult events and mass times in ${locationData.location}.`);
  };

  const handleSamplePromptClick = (promptText) => {
    setPrompt(promptText);
    setSelectedResource(null);
    setSelectedLocation(null);
  };

  const scrollToBottom = () => {
    if (chatMessagesWrapperRef.current) {
      chatMessagesWrapperRef.current.scrollTo({
        top: chatMessagesWrapperRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const handleRecommendedPromptClick = (promptText) => {
    setPrompt(promptText);
  };

  const parseXmlResponse = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const reflectionElement = xmlDoc.getElementsByTagName("reflection")[0];
    if (reflectionElement) {
      const opening = reflectionElement.getElementsByTagName("opening")[0]?.textContent;
      const content = reflectionElement.getElementsByTagName("content")[0];
      const readingConnection = content?.getElementsByTagName("readingConnection")[0]?.textContent;
      const spiritualGuidance = content?.getElementsByTagName("spiritualGuidance")[0]?.textContent;
      const challengeProgress = content?.getElementsByTagName("challengeProgress")[0]?.textContent;
      const personalGrowth = content?.getElementsByTagName("personalGrowth")[0]?.textContent;
      const question = content?.getElementsByTagName("question")[0]?.textContent;
      const actionStep = content?.getElementsByTagName("actionStep")[0]?.textContent;
      const closing = reflectionElement.getElementsByTagName("closing")[0]?.textContent;
      const recommendedPrompts = content?.getElementsByTagName("recommendedPrompts")[0];
      const prompt1 = recommendedPrompts?.getElementsByTagName("prompt1")[0]?.textContent;
      const prompt2 = recommendedPrompts?.getElementsByTagName("prompt2")[0]?.textContent;

      return (
        <div className="structured-reflection">
          {opening && <p className="reflection-opening">{opening}</p>}
          <div className="reflection-content">
            {readingConnection && (
              <div className="reading-connection">
                <h3>Gospel Connection</h3>
                <p>{readingConnection}</p>
              </div>
            )}
            {spiritualGuidance && (
              <div className="spiritual-guidance">
                <h3>Spiritual Guidance</h3>
                <p>{spiritualGuidance}</p>
              </div>
            )}
            {challengeProgress && (
              <div className="challenge-progress">
                <h3>Your Faith Journey Progress</h3>
                <p>{challengeProgress}</p>
              </div>
            )}
            {personalGrowth && (
              <div className="personal-growth">
                <h3>Personal Growth Insights</h3>
                <div className="insight-content">
                  <p>{personalGrowth}</p>
                </div>
              </div>
            )}
            {question && (
              <div className="reflection-question">
                <h3>Reflection Question</h3>
                <p>{question}</p>
              </div>
            )}
            {actionStep && (
              <div className="action-step">
                <h3>Action Step</h3>
                <div className="step-content">
                  <p>{actionStep}</p>
                </div>
              </div>
            )}
          </div>
          {closing && <p className="reflection-closing">{closing}</p>}
          {(prompt1 || prompt2) && (
            <div className="recommended-prompts">
              <h3>Continue Your Reflection</h3>
              <p>Click on a prompt to explore further:</p>
              <div className="recommended-prompts-container">
                {prompt1 && (
                  <div className="recommended-prompt" onClick={() => handleRecommendedPromptClick(prompt1)}>
                    <span className="prompt-icon">💡</span>
                    <span className="prompt-text">{prompt1}</span>
                  </div>
                )}
                {prompt2 && (
                  <div className="recommended-prompt" onClick={() => handleRecommendedPromptClick(prompt2)}>
                    <span className="prompt-icon">💡</span>
                    <span className="prompt-text">{prompt2}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      const currentPrompt = prompt.trim();
      if (currentPrompt && effectiveUserId) {
        if (!isUnlimited && chatResponseCount >= chatResponseLimit) {
          setShowLimitCTA(true);
          setPrompt('');
          return;
        }
        setMessages((prevMessages) => [...prevMessages, { role: 'user', content: currentPrompt }]);
        setPrompt('');
        setIsLoading(true);
        setLoadingMessage(`Thanks, loading your response.`);
        try {
          // Send request with both the user's input and selected resource
          const response = await axios.post(API_ENDPOINTS.GOSPEL_REFLECTION, {
            user_id: effectiveUserId,
            message: currentPrompt,
            selected_resource: selectedResource,
            selected_location: selectedLocation,
            group_id: selectedGroupId
          });

          // Reset selections immediately after sending
          setSelectedResource(null);
          setSelectedLocation(null);

          const parsedReflection = parseXmlResponse(response.data.reflection);
          setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: parsedReflection }]);
          
          if (!isUnlimited) {
            const newCount = chatResponseCount + 1;
            dispatch(updateLocalChatResponseCount(newCount));
            await dispatch(fetchChatResponseCount(effectiveUserId));
          }
        } catch (error) {
          let errorMessage = 'An error occurred while processing your request.';
          if (error.response) {
            if (error.response.status === 401) {
              errorMessage = 'Authentication failed. Please try logging in again.';
            } else if (error.response.status === 403) {
              errorMessage = 'You do not have permission to perform this action.';
            } else if (error.response.status === 404) {
              errorMessage = 'The requested resource was not found.';
            } else if (error.response.status >= 500) {
              errorMessage = 'A server error occurred. Please try again later.';
            }
          } else if (error.request) {
            errorMessage = 'No response received from the server. Please check your internet connection.';
          } else {
            errorMessage = `An error occurred: ${error.message}`;
          }
          setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: <p className="error-message">{errorMessage}</p> }]);
          if (error.response && error.response.status === 401) {
            dispatch(logout());
          }
        } finally {
          setIsLoading(false);
        }
      }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCloseLimitCTA = () => {
    setShowLimitCTA(false);
  };

  const samplePrompts = [
    {
      title: "Integrate Spirituality with Work",
      text: "My startup is trying to get more users for a Catholic Spiritual Director AI, how to approach this?"
    },
    {
      title: "Scructured Spiritual Lessons",
      text: "Choose a Focus or Opus Dei lesson; enter a specific prompt to reflect on it.",
      isEnhanced: true,
      component: EnhancedSamplePrompt
    },
    {
      title: "Personal Matters",
      text: "One of the guys I play soccer with is disrespectful to everyone. How to handle this relationship?"
    },
  ];

  return (
    <div className="chat">
      <div className="chat-content">
        <Header />
        <div className="chat-container">
          <Navbar />
          <div className="chat-main">
            <div className="chat-settings-centered">
              <button 
                className="settings-button"
                onClick={toggleSettings}
              >
                <FaUsers size={16} />
                <span className="group-name">
                  {selectedGroupName}
                </span>
                <FaChevronDown 
                  size={12} 
                  style={{ 
                    transform: isSettingsOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>
              
              <div className={`settings-dropdown ${isSettingsOpen ? 'open' : ''}`}>
                <div className="settings-dropdown-header">
                  Select Chat Mode
                </div>
                <div 
                  className={`group-option ${!selectedGroupId ? 'selected' : ''}`}
                  onClick={() => handleGroupChange('')}
                >
                  <FaGlobe size={14} />
                  <span>General Chat</span>
                  {!selectedGroupId && <FaCheck className="check-icon" size={12} />}
                </div>
                {userGroups.map(group => (
                  <div 
                    key={group.id}
                    className={`group-option ${selectedGroupId === group.id ? 'selected' : ''}`}
                    onClick={() => handleGroupChange(group.id.toString())}
                  >
                    <FaUsers size={14} />
                    <span>{group.name}</span>
                    {selectedGroupId === group.id && <FaCheck className="check-icon" size={12} />}
                  </div>
                ))}
              </div>
            </div>

            {!isCountLoading && showLimitCTA && (
              <div className="limit-cta">
                <button className="close-cta" onClick={handleCloseLimitCTA}>&times;</button>
                <h3>{effectiveUserId >= 4000 ? "Guest limit reached" : "Daily limit reached"}</h3>
                <p>
                  {effectiveUserId >= 4000 
                    ? <Link to="/signup">Register</Link> 
                    : <Link to="/upgrade">Upgrade to premium</Link>
                  } to continue.
                </p>
              </div>
            )}
            <div className="chat-messages-wrapper">
              <div className="chat-messages" ref={chatMessagesWrapperRef}>
                <div className="message assistant">
                  <div className="message-content system-message">
                    <h2 className="system-title">Catholic AI Spiritual Director</h2>
                    <p className="system-description">
                      Integrate spiritual guidance into professional, faith, and personal matters. All accounts are free during our beta launch period.
                      Enter your weekly activities in the faith journey page to receive more personalized guidance (and upon registration feel free to share your background).  
                    </p>
                  </div>
                </div>
                <div className="sample-prompts">
                  {groupSamplePrompts.length > 0 ? (
                    groupSamplePrompts.map((prompt, index) => (
                      <div
                        key={index}
                        className="sample-prompt"
                        onClick={() => handleSamplePromptClick(prompt.description)}
                      >
                        <div className="sample-prompt-header">
                          <FaLightbulb /> {prompt.title}
                        </div>
                        <div className="sample-prompt-text">{prompt.description}</div>
                      </div>
                    ))
                  ) : (
                    samplePrompts.map((samplePrompt, index) => (
                      samplePrompt.isEnhanced ? (
                        <samplePrompt.component
                          key={index}
                          onResourceSelect={handleResourceSelect}
                          onLocationSelect={handleLocationSelect}
                        />
                      ) : (
                        <div
                          key={index}
                          className="sample-prompt"
                          onClick={() => handleSamplePromptClick(samplePrompt.text)}
                        >
                          <div className="sample-prompt-header">
                            <FaLightbulb /> {samplePrompt.title}
                          </div>
                          <div className="sample-prompt-text">{samplePrompt.text}</div>
                        </div>
                      )
                    ))
                  )}
                </div>

                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.role}`}>
                    <div className="message-content">
                      {typeof message.content === 'string' ? <p>{message.content}</p> : message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant">
                    <div className="message-content loading-message">
                      <div className="loading-spinner"></div>
                      <p>{loadingMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <div className="chat-form-inner">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your message..."
            required
            disabled={isLoading || showLimitCTA}
          ></textarea>
          <div className="chat-form-actions">
            {!isUnlimited && chatResponseLimit !== null && (
              <div className="chat-limit-info">
                <FaInfoCircle /> <p>{Math.max(0, chatResponseLimit - chatResponseCount)} {effectiveUserId < 4000 ? 'daily' : ''} messages remaining.</p>
              </div>
            )}
            <button type="submit" disabled={isLoading || showLimitCTA}>
              {isLoading ? (
                <div className="loading-spinner"></div>
              ) : (
                <>
                  <FaPaperPlane /> Send
                </>
              )}
            </button>
          </div>
        </div>
      </form>
      {showPopup && (
        <div className={`popup ${isSuccess ? 'success' : 'error'}`}>
          <p>{popupMessage}</p>
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Chat;

