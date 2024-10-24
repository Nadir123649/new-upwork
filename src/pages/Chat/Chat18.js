import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout, fetchUserId, initializeUserId } from '../../store/actions/userActions';
import './Chat.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';
import WebsiteTour from '../../components/WebsiteTour/WebsiteTour';
import { API_ENDPOINTS } from '../../config/api';

const Chat = () => {
  const { isAuthorized, userId, tempUserId, email } = useSelector((state) => state.user);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const chatMessagesWrapperRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [chatResponseCount, setChatResponseCount] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const effectiveUserId = userId || tempUserId;

  useEffect(() => {
    const checkTourStatus = async () => {
      if (effectiveUserId) {
        try {
          const response = await axios.get(`${API_ENDPOINTS.CHECK_TOUR_STATUS}?user_id=${effectiveUserId}`);
          setShowTour(!response.data.never_see_again);
        } catch (error) {
          console.error('Error checking tour status:', error);
          setShowTour(true);
        }
      }
    };
    checkTourStatus();
  }, [effectiveUserId]);

  console.log('Chat Component - userId:', userId);
  console.log('Chat Component - tempUserId:', tempUserId);
  console.log('Chat Component - isAuthorized:', isAuthorized);

  useEffect(() => {
    console.log('Chat useEffect - userId:', userId);
    console.log('Chat useEffect - tempUserId:', tempUserId);
    console.log('Chat useEffect - isAuthorized:', isAuthorized);

    if (isAuthorized && email && !userId) {
      console.log('Fetching userId for email:', email);
      dispatch(fetchUserId(email));
    }
  }, [isAuthorized, email, userId, dispatch]);

  useEffect(() => {
    if (!userId) {
      console.log('Initializing userId');
      dispatch(initializeUserId());
    }
  }, [userId, dispatch]);

  useEffect(() => {
    const fetchStatus = async () => {
      if (effectiveUserId && !isAuthorized) {
        try {
          const countResponse = await axios.get(API_ENDPOINTS.CHAT_RESPONSE_COUNT, {
            params: { user_id: effectiveUserId }
          });
          setChatResponseCount(countResponse.data.count);
        } catch (error) {
          console.error('Error fetching chat response count:', error);
        }
      }
    };

    fetchStatus();
  }, [userId, tempUserId, isAuthorized]);

  useEffect(() => {
    if (location.state?.showSuccessPopup) {
      setShowPopup(true);
      setPopupMessage(location.state.message);
      setIsSuccess(true);
      
      window.history.replaceState({}, document.title)
      
      const timer = setTimeout(() => setShowPopup(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const scrollToBottom = () => {
    if (chatMessagesWrapperRef.current) {
      chatMessagesWrapperRef.current.scrollTo({
        top: chatMessagesWrapperRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

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

  const handleRecommendedPromptClick = (promptText) => {
    setPrompt(promptText);
    // Optionally, you can automatically submit the form here
    // handleSubmit({ preventDefault: () => {} });
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
      const question = content?.getElementsByTagName("question")[0]?.textContent;
      const closing = reflectionElement.getElementsByTagName("closing")[0]?.textContent;
      
      // Extract recommended prompts
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
            
            {question && (
              <div className="reflection-question">
                <h3>Reflection Question</h3>
                <p>{question}</p>
              </div>
            )}
            
            {/* Recommended prompts section */}
            {(prompt1 || prompt2) && (
              <div className="recommended-prompts">
                <h3>Continue Your Reflection</h3>
                <p>Click on a prompt to explore further:</p>
                <div className="recommended-prompts-container">
                  {prompt1 && (
                    <div className="recommended-prompt" onClick={() => handleRecommendedPromptClick(prompt1)}>
                      <span className="prompt-icon">&#128161;</span>
                      <span className="prompt-text">{prompt1}</span>
                    </div>
                  )}
                  {prompt2 && (
                    <div className="recommended-prompt" onClick={() => handleRecommendedPromptClick(prompt2)}>
                      <span className="prompt-icon">&#128161;</span>
                      <span className="prompt-text">{prompt2}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {closing && <p className="reflection-closing">{closing}</p>}
        </div>
      );
    } else {
      const errorElement = xmlDoc.getElementsByTagName("error")[0];
      return <p className="error-message">{errorElement ? errorElement.textContent : "An error occurred while processing the reflection."}</p>;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const effectiveUserId = userId || tempUserId;
    const currentPrompt = prompt.trim();

    if (currentPrompt && effectiveUserId) {
      if (!isAuthorized && chatResponseCount >= 3) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'user', content: currentPrompt },
          { role: 'assistant', content: 'Limit reached. Please register an account to continue using the chat.' },
        ]);
        setPrompt('');
        return;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: currentPrompt },
      ]);
      setPrompt('');
      setIsLoading(true);
      setLoadingMessage(`Thanks, allow a minute to load your response.`);

      try {
        const response = await axios.post(API_ENDPOINTS.GOSPEL_REFLECTION, {
          user_id: effectiveUserId,
          message: currentPrompt
        });

        const parsedReflection = parseXmlResponse(response.data.reflection);

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: parsedReflection },
        ]);

        if (!isAuthorized) {
          setChatResponseCount(prevCount => prevCount + 1);
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

  const samplePrompts = [
    { 
      title: "Faith & Work Integration", 
      text: "How can I apply Catholic social teaching to ethical decision-making in my tech startup?" 
    },
    { 
      title: "Spiritual Growth Challenge", 
      text: "Suggest a daily prayer routine that fits my busy schedule as a young professional." 
    },
    { 
      title: "Gospel in Daily Life", 
      text: "Relate today's gospel reading to my role as a healthcare worker during the pandemic." 
    }
  ];

  const handleSamplePromptClick = (promptText) => {
    setPrompt(promptText);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="chat">
      {showTour && <WebsiteTour userId={effectiveUserId} />}
      <div className="chat-content">
        <Header />
        <div className="chat-container">
          <Navbar />
          <div className="chat-main">
            <div className="chat-messages-wrapper">
              <div className="chat-messages" ref={chatMessagesWrapperRef}>
                <div className="message assistant">
                  <div className="message-content system-message">
                    <h2 className="system-title">Daily Gospel Reflection</h2>
                    <p className="system-description">
                      Receive personalized reflections on today's gospel reading. Ask for guidance or share your thoughts for a tailored spiritual insight.
                    </p>
                  </div>
                </div>
                <div className="sample-prompts">
                  {samplePrompts.map((samplePrompt, index) => (
                    <div
                      key={index}
                      className="sample-prompt"
                      onClick={() => handleSamplePromptClick(samplePrompt.text)}
                    >
                      <div className="sample-prompt-header">{samplePrompt.title}</div>
                      <div className="sample-prompt-text">{samplePrompt.text}</div>
                    </div>
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
                    <div className="message-content">
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
          <div className="textarea-container">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your message..."
              required
              disabled={isLoading}
            ></textarea>
            {!isAuthorized && (
              <div className="chat-limit-info">
                <p>{Math.max(0, 3 - chatResponseCount)} free messages remaining</p>
              </div>
            )}
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Submit'
            )}
          </button>
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