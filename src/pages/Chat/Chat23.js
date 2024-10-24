













import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout, fetchUserId, initializeUserId, fetchChatResponseCount, updateLocalChatResponseCount } from '../../store/actions/userActions';
import './Chat.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';
import { API_ENDPOINTS } from '../../config/api';
import { FaPaperPlane, FaLightbulb, FaInfoCircle } from 'react-icons/fa';
import EnhancedSamplePrompt from '../../components/EnhancedSamplePrompt/EnhancedSamplePrompt';
import EnhancedSamplePromptYoungAdult from '../../components/EnhancedSamplePromptYoungAdult/EnhancedSamplePromptYoungAdult';

const Chat = () => {
  const { isAuthorized, userId, tempUserId, email, chatResponseCount, chatResponseLimit, isUnlimited } = useSelector((state) => state.user);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const chatMessagesWrapperRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const [showLimitCTA, setShowLimitCTA] = useState(false);
  const [isCountLoading, setIsCountLoading] = useState(true);
  const effectiveUserId = userId || tempUserId;
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [primaryGroup, setPrimaryGroup] = useState(null);

  console.log('Chat Component - Initial render');
  console.log('userId:', userId);
  console.log('tempUserId:', tempUserId);
  console.log('isAuthorized:', isAuthorized);
  console.log('chatResponseCount:', chatResponseCount);
  console.log('chatResponseLimit:', chatResponseLimit);
  console.log('isUnlimited:', isUnlimited);

  useEffect(() => {
    console.log('useEffect - Authorization check');
    console.log('isAuthorized:', isAuthorized);
    console.log('email:', email);
    console.log('userId:', userId);

    if (isAuthorized && email && !userId) {
      console.log('Fetching userId for email:', email);
      dispatch(fetchUserId(email));
    }
  }, [isAuthorized, email, userId, dispatch]);

  useEffect(() => {
    console.log('useEffect - Initialize userId');
    console.log('userId:', userId);

    if (!userId) {
      console.log('Initializing userId');
      dispatch(initializeUserId());
    }
  }, [userId, dispatch]);

  useEffect(() => {
    console.log('useEffect - Fetch chat response count');
    console.log('effectiveUserId:', effectiveUserId);

    if (effectiveUserId) {
      console.log('Dispatching fetchChatResponseCount');
      setIsCountLoading(true);
      dispatch(fetchChatResponseCount(effectiveUserId))
        .then(() => setIsCountLoading(false))
        .catch(() => setIsCountLoading(false));
    }
  }, [effectiveUserId, dispatch]);

  useEffect(() => {
    console.log('useEffect - Update showLimitCTA');
    console.log('isUnlimited:', isUnlimited);
    console.log('chatResponseCount:', chatResponseCount);
    console.log('chatResponseLimit:', chatResponseLimit);
    console.log('isCountLoading:', isCountLoading);

    if (!isCountLoading && !isUnlimited && chatResponseCount !== null && chatResponseLimit !== null) {
      const shouldShowCTA = chatResponseCount >= chatResponseLimit;
      console.log('Setting showLimitCTA to', shouldShowCTA);
      setShowLimitCTA(shouldShowCTA);
    }
  }, [chatResponseCount, chatResponseLimit, isUnlimited, isCountLoading]);

  useEffect(() => {
    console.log('useEffect - Handle success popup');
    if (location.state?.showSuccessPopup) {
      setShowPopup(true);
      setPopupMessage(location.state.message);
      setIsSuccess(true);
      
      window.history.replaceState({}, document.title)
      
      const timer = setTimeout(() => setShowPopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const fetchPrimaryGroup = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.USER_PRIMARY_GROUP}/${effectiveUserId}`);
        setPrimaryGroup(response.data.group);
      } catch (error) {
        console.error('Error fetching primary group:', error);
      }
    };

    if (effectiveUserId) {
      fetchPrimaryGroup();
    }
  }, [effectiveUserId]);

  const handleResourceSelect = (resourceData) => {
    setSelectedResource(resourceData);
    setSelectedLocation(null);
    setPrompt(`Tell me about the "${resourceData.resource}" from ${resourceData.orgName}'s ${resourceData.category} category.`);
  };

  const handleLocationSelect = (locationData) => {
    setSelectedLocation(locationData);
    setSelectedResource(null);
    setPrompt(`Tell me about young adult events and mass times in ${locationData.location}.`);
  };

  const handleSamplePromptClick = (promptText) => {
    console.log('handleSamplePromptClick', promptText);
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

  useEffect(() => {
    console.log('useEffect - Scroll to bottom');
    console.log('messages length:', messages.length);
    console.log('isLoading:', isLoading);

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

  const handleRecommendedPromptClick = (promptText) => {
    console.log('handleRecommendedPromptClick', promptText);
    setPrompt(promptText);
  };

  const parseXmlResponse = (xmlString) => {
    console.log('parseXmlResponse');
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
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentPrompt = prompt.trim();

    console.log('handleSubmit');
    console.log('currentPrompt:', currentPrompt);
    console.log('effectiveUserId:', effectiveUserId);
    console.log('isUnlimited:', isUnlimited);
    console.log('chatResponseCount:', chatResponseCount);
    console.log('chatResponseLimit:', chatResponseLimit);
    console.log('selectedResource:', selectedResource);
    console.log('selectedLocation:', selectedLocation);
    console.log('primaryGroup:', primaryGroup);

    if (currentPrompt && effectiveUserId) {
      if (!isUnlimited && chatResponseCount >= chatResponseLimit) {
        console.log('Limit reached, showing CTA');
        setShowLimitCTA(true);
        setPrompt('');
        return;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: currentPrompt },
      ]);
      setPrompt('');
      setIsLoading(true);
      setLoadingMessage(`Thanks, loading your response.`);

      try {
        console.log('Sending request to API');
        const response = await axios.post(API_ENDPOINTS.GOSPEL_REFLECTION, {
          user_id: effectiveUserId,
          message: currentPrompt,
          selected_resource: selectedResource,
          selected_location: selectedLocation,
          group_id: primaryGroup ? primaryGroup.id : null
        });

        setSelectedResource(null);
        setSelectedLocation(null);

        console.log('API response received');
        const parsedReflection = parseXmlResponse(response.data.reflection);

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: parsedReflection },
        ]);

        if (!isUnlimited) {
          console.log('Updating local chat response count');
          console.log('Before update - chatResponseCount:', chatResponseCount);
          const newCount = chatResponseCount + 1;
          dispatch(updateLocalChatResponseCount(newCount));
          console.log('After update - chatResponseCount:', newCount);
          
          console.log('Fetching updated chat response count from server');
          await dispatch(fetchChatResponseCount(effectiveUserId));
          
          console.log('Updated chatResponseCount from server:', chatResponseCount);
        }

      } catch (error) {
        console.error('Error in chat request:', error);
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

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: <p className="error-message">{errorMessage}</p> },
        ]);

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
    console.log('handleCloseLimitCTA');
    setShowLimitCTA(false);
  };

  const samplePrompts = [
    {
      title: "Personal and Professional Reflections",
      text: "My startup launched a Catholic AI Spiritual Director product, provide advice on talking to possible users."
    },
    {
      title: "Select Organizational Text",
      text: "Choose a specific reflection to customize your reflection",
      isEnhanced: true,
      component: EnhancedSamplePrompt
    },
    {
      title: "Young Adult Events and Mass Times",
      text: "Choose a location to find young adult events and mass times",
      isEnhanced: true,
      component: EnhancedSamplePromptYoungAdult
    }
  ];

  console.log('Render - chatResponseCount:', chatResponseCount);
  console.log('Render - isUnlimited:', isUnlimited);

  return (
    <div className="chat">
      <div className="chat-content">
        <Header />
        <div className="chat-container">
          <Navbar />
          <div className="chat-main">
            {primaryGroup && (
              <div className="primary-group-info">
                <p>Current Group: {primaryGroup.name}</p>
              </div>
            )}
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
                      Engage in daily gospel reflections that can be personalized through progress in your faith activities.  
                      Track your growth and convert points earned for accomplishments into stock investing rewards. 
                    </p>
                  </div>
                </div>
                <div className="sample-prompts">
                  {samplePrompts.map((samplePrompt, index) => (
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
                        <div className="sample-prompt-header"><FaLightbulb /> {samplePrompt.title}</div>
                        <div className="sample-prompt-text">{samplePrompt.text}</div>
                      </div>
                    )
                  ))}
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
                <FaInfoCircle /> <p>{Math.max(0, chatResponseLimit - chatResponseCount)} {effectiveUserId < 4000 ? 'daily' : ''} messages remaining</p>
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

