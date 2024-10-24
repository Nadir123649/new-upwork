import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout, fetchUserId, initializeUserId } from '../../store/actions/userActions';
import { checkAuthStatus } from '../../store/actions/authActions';
import { updateOnboardingResponse, fetchOnboardingStatus } from '../../store/actions/onboardingActions';
import './Chat.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';
import PriceMetricsChart from '../../components/AIMetricsChart/PriceMetricsChart';
import ReactDOM from 'react-dom';
import { updateOnboardingStatus } from '../../store/actions/onboardingActions';
import {initiateSchwabAuth } from '../../store/actions/authActions'; // Add this import


const Chat = () => {
  const { isAuthorized, userId, tempUserId, email } = useSelector((state) => state.user);
  const { isSchwabAuthenticated } = useSelector((state) => state.auth);
  const { step: onboardingStep, question: onboardingQuestion, completed: onboardingCompleted } = useSelector((state) => state.onboarding);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading Your Response. Please Wait Up To 30 Seconds.'); 
  const chatMessagesWrapperRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [conversationId, setConversationId] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [stockReturns, setStockReturns] = useState(null);
  const [aiFacts, setAiFacts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);
  const location = useLocation();
  const [currentOnboardingQuestion, setCurrentOnboardingQuestion] = useState('');
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(1);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [authInitiated, setAuthInitiated] = useState(false);
  const [authExpiresAt, setAuthExpiresAt] = useState(null);
  const [authData, setAuthData] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [error, setError] = useState(null);
  const [chatResponseCount, setChatResponseCount] = useState(0);


  useEffect(() => {
    if (isAuthorized && email && !userId) {
      dispatch(fetchUserId(email));
    }
  }, [isAuthorized, email, userId, dispatch]);


  useEffect(() => {
    if (!userId && !tempUserId) {
      dispatch(initializeUserId());
    }
  }, [userId, tempUserId, dispatch]);


  // New useEffect for fetching daily update
  useEffect(() => {
    const fetchDailyUpdate = async () => {
      if (userId && userId < 4000) {
        try {
          const response = await axios.get('http://localhost:5052/api/daily_update', {
            params: { user_id: userId }
          });
          if (response.data.daily_update) {
            setMessages([{ role: 'assistant', content: response.data.daily_update }]);
          }
        } catch (error) {
          console.error('Error fetching daily update:', error);
        }
      }
    };

    fetchDailyUpdate();
  }, [userId]);


  useEffect(() => {
    const fetchStatus = async () => {
      if (userId) {
        console.log('Fetching status for user ID:', userId);
        console.log('Is user authorized:', isAuthorized);

        try {
          const onboardingResponse = await axios.get('http://localhost:5052/get_onboarding_status', {
            params: { user_id: userId }
          });

          console.log('Onboarding status:', onboardingResponse.data);
          setIsOnboarding(!onboardingResponse.data.completed);
          if (!onboardingResponse.data.completed) {
            setCurrentOnboardingStep(onboardingResponse.data.current_step);
            setCurrentOnboardingQuestion(onboardingResponse.data.current_question);
            setMessages(prevMessages => {
              if (prevMessages.length === 0) {
                return [{ role: 'assistant', content: onboardingResponse.data.current_question }];
              }
              return prevMessages;
            });
          }

          // Only fetch chat response count for unauthorized users
          if (!isAuthorized) {
            const countResponse = await axios.get('http://localhost:5052/get_chat_response_count', {
              params: { user_id: userId }
            });
            console.log('Chat response count:', countResponse.data.count);
            setChatResponseCount(countResponse.data.count);
          } else {
            console.log('User is authorized, not fetching chat response count');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      } else {
        console.log('No user ID available, skipping status fetch');
      }
    };

    fetchStatus();
  }, [userId, isAuthorized]);



  useEffect(() => {
    const fetchAuthStatus = async () => {
      if (userId) {
        await dispatch(checkAuthStatus(userId));
      }
    };
    fetchAuthStatus();
  }, [userId, dispatch]);

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

  const toggleAccountDropdown = () => {
    setIsAccountDropdownOpen(!isAccountDropdownOpen);
  };


  // FIXED_AMINE 1.change the code of this function
  const scrollToBottom = () => {
     if (chatMessagesWrapperRef.current) {
       chatMessagesWrapperRef.current.scrollTo({
         top: chatMessagesWrapperRef.current.scrollHeight,
         behavior: "smooth",
       });
     } else {
       console.error("chatMessagesWrapperRef is not defined.");
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
    if (isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, []);

  const accountDropdownRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    let intervalId;
    let timeoutId;
    const checkAuthCompletion = async () => {
      if (userId && isOnboarding && isCheckingAuth) {
        try {
          const response = await axios.get(`http://localhost:5011/check_auth_completion`, {
            params: { user_id: userId }
          });
          if (response.data.completed) {
            setIsCheckingAuth(false);
            fetchAuthData(userId);
            clearInterval(intervalId);
            clearTimeout(timeoutId);
          }
        } catch (error) {
          console.error('Error checking auth completion:', error);
        }
      }
    };

    if (isCheckingAuth) {
      intervalId = setInterval(checkAuthCompletion, 5000); // Check every 5 seconds
      
      // Set a timeout to stop checking after 5 minutes
      timeoutId = setTimeout(() => {
        setIsCheckingAuth(false);
        clearInterval(intervalId);
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'assistant', content: 'Authentication process timed out. Please try again.' }
        ]);
      }, 300000); // 5 minutes
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId, isOnboarding, isCheckingAuth]);


  const fetchAuthData = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5011/get_auth_data`, {
        params: { user_id: userId }
      });
      setAuthData(response.data);
      displayAuthDataMessage(response.data);
    } catch (error) {
      console.error('Error fetching auth data:', error);
    }
  };

  const displayAuthDataMessage = (data) => {
    const message = `
      Authentication successful!
      
      Account Number: ${data.account_number}
      Account Balance: $${data.balance}
      Current Positions: ${JSON.stringify(data.positions, null, 2)}
      
      Starting Cash (from Strategy Objective): $${data.starting_cash}
      
      Optimal Portfolio:
      ${JSON.stringify(data.optimal_portfolio, null, 2)}
      
      To execute these orders, please provide the following 5-digit verification code: ${data.verification_code}
    `;

    setMessages(prevMessages => [
      ...prevMessages,
      { role: 'assistant', content: message }
    ]);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const authStatus = params.get('auth_status');
    const userId = params.get('user_id');

    if (authStatus === 'success' && userId) {
      // Authentication was successful
      dispatch(checkAuthStatus(userId)); // This should update the Redux store with the new auth status
      fetchAuthData(userId);
    } else if (authStatus === 'error') {
      console.error('Schwab authentication failed');
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: 'Schwab authentication failed. Please try again.' }
      ]);
    }
  }, [location]);


  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const { data } = await axios.get('http://localhost:5052/get_conversation_id', {
          params: { 
            user_id: userId,
            is_authorized: isAuthorized,
            conversation_id: conversationId
          },
        });

        if (data.error) {
          console.error(data.error);
        } else {
          const formattedMessages = data.response.map((item) => [
            { role: 'user', content: item.prompt },
            { role: 'assistant', content: item.response },
          ]).flat();
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchConversation();
  }, [userId, isAuthorized, conversationId]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Handle submit triggered');
    console.log('Is user authorized:', isAuthorized);
    console.log('Current chat response count:', chatResponseCount);

    const effectiveUserId = userId || tempUserId;
    console.log('Effective user ID:', effectiveUserId);

    if (prompt.trim() && effectiveUserId) {
      console.log('Prompt is valid and effective user ID exists');
      
      // Check if user is not authorized and has reached the limit
      if (!isAuthorized && chatResponseCount >= 5) {
        console.log('Unauthorized user has reached message limit');
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'user', content: prompt },
          { role: 'assistant', content: 'Limit reached. Please register an account to continue using the chat.' },
        ]);
        setPrompt('');
        return;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: prompt },
      ]);
      setPrompt('');
      setIsLoading(true);
      setError(null);

      try {
        console.log('Sending chat request to server');
        const response = await axios.post('http://localhost:5052/api/chat', {
          message: prompt,
          conversation_id: conversationId,
          user_id: effectiveUserId,
          is_authorized: isAuthorized,
          is_schwab_authenticated: isSchwabAuthenticated,
          onboarding_step: currentOnboardingStep,
          verification_code: authData ? authData.verification_code : null
        }, { 
          timeout: 600000 // 10 minutes
        });

        console.log('Full API Response:', response);
        console.log('Response data:', response.data);

        const data = response.data;

        // New code to update loading message
        if (data.onboarding_step === 'ready_to_authenticate') {
          setLoadingMessage('Creating optimal portfolio wait 3 minutes');
        } else {
          setLoadingMessage('Loading Your Response. Please Wait Up To 30 Seconds.');
        }

        if (typeof data === 'string') {
          try {
            const parsedData = JSON.parse(data);
            handleResponseData(parsedData);
          } catch (error) {
            console.error('Error parsing response data:', error);
            setError('Received an unexpected response from the server.');
          }
        } else {
          handleResponseData(data);
        }

        // Increment the chat response count only if the user is not authorized
        if (!isAuthorized) {
          console.log('Incrementing chat response count for unauthorized user');
          setChatResponseCount(prevCount => {
            const newCount = prevCount + 1;
            console.log('New chat response count:', newCount);
            return newCount;
          });
        }

      } catch (error) {
        console.error('Error in chat request:', error);

        let errorMessage = 'An error occurred while processing your request.';

        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
          console.error('Error response headers:', error.response.headers);

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
          console.error('Error request:', error.request);
          errorMessage = 'No response received from the server. Please check your internet connection.';
        } else {
          console.error('Error message:', error.message);
          errorMessage = `An error occurred: ${error.message}`;
        }

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: errorMessage },
        ]);

        if (error.response && error.response.status === 401) {
          dispatch(logout());
        }

        setError(errorMessage);
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

  const handleLogout = () => {
    dispatch(logout());
  };

  const toggleNavbar = () => {
    setIsNavbarOpen(!isNavbarOpen);
  };


  const handleResponseData = (data) => {
    if (data.status === "authenticating") {
      dispatch(initiateSchwabAuth());
      setIsCheckingAuth(true);
    } else if (data.status === "completed") {
      setIsCheckingAuth(false);
      setCurrentOnboardingStep(null);
      setCurrentOnboardingQuestion('');
      setAuthData(null);
    } else if (data.status === "in_progress") {
      setCurrentOnboardingStep(data.onboarding_step);
      setCurrentOnboardingQuestion(data.response);
    }

    if (data.response) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: data.response },
      ]);
    } else {
      console.error('Response does not contain expected data:', data);
      setError('Received an unexpected response from the server.');
    }

    // Handle other data
    if (data.stock_returns) {
      setStockReturns(data.stock_returns);
    }
    if (data.additional_data && data.additional_data.ai_facts) {
      setAiFacts(data.additional_data.ai_facts);
    } else {
      setAiFacts([]);
    }
    if (data.chart_data) {
      setChartData(data.chart_data);
    }
  };









  const renderMessageContent = (content) => {
    if (!content) {
      console.error('No content provided to renderMessageContent');
      return <p>No content available</p>;
    }

    console.log('Content received in renderMessageContent:', content);

    // If content is an object, stringify it
    if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2);
    }

    if (content.includes('<a href=')) {
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    const cleanedContent = content.replace(/^```html/, '').replace(/```$/, '').trim();

    if (cleanedContent.includes('<div class="ai-initiative-report">')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedContent, 'text/html');
      
      const chartContainer = doc.querySelector('.chart-container');
      if (chartContainer) {
        chartContainer.innerHTML = '<div id="ai-metrics-chart" style="width: 100%; height: 100%;"></div>';
      }

      return (
        <div 
          className="report-content"
          dangerouslySetInnerHTML={{ __html: doc.body.innerHTML }} 
        />
      );
    } else {
      // Regular expression to detect URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      
      return cleanedContent.split('\n').map((line, lineIndex) => {
        const parts = line.split(urlRegex);
        return (
          <p key={lineIndex}>
            {parts.map((part, partIndex) => 
              part.match(urlRegex) 
                ? <a key={partIndex} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
                : part
            )}
          </p>
        );
      });
    }
  };



  useEffect(() => {
    if (chartData && document.getElementById('ai-metrics-chart')) {
      ReactDOM.render(
        <PriceMetricsChart 
          chartData={chartData}
          stockReturns={stockReturns || {}}
          aiFacts={aiFacts}
        />, 
        document.getElementById('ai-metrics-chart')
      );
    }
  }, [messages, chartData, stockReturns, aiFacts]);

  const samplePrompts = [
    "Provide a view of JP Morgan's customer facing GenAI products.",
    "What is the top ranked Catholic AI-Efficient fintech company?",
    "Explain recent AI initatives that impacted my Biotech portfolio holdings."
  ];

  const handleSamplePromptClick = (prompt) => {
    setPrompt(prompt);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="chat">
      <div className="chat-content">
        <Header />
        <div className="chat-container">
          <Navbar />
          <div className="chat-main">
            <div className="chat-messages-wrapper">
              <div className="chat-messages" ref={chatMessagesWrapperRef}>
                {isOnboarding ? (
                  messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                      <div className="message-content">
                        {renderMessageContent(message.content)}
                      </div>
                    </div>
                  ))
                ) : (

                  <>
                    <div className="message assistant">
                      <div className="message-content system-message">
                        <h2 className="system-title">Catholic Generative AI Efficient Spiritual Investing Guide</h2>
                        <p className="system-description">
                          Discover the leading Generative AI product developments and metrics to find companies with opportunity to improve their efficiency with Catholic-Aligned initatives. Investing information includes this week's gospel readings for a spiritual tone and reflection considerations.    
                        </p>
                        
                        <h3 className="system-subtitle">Available Metrics Include:</h3>
                        <ul className="system-list">
                          <li>AI: Number of Generative AI Products, Forecasted AI Investment Next 3 Years, Number of AI Employment Roles (+60 others).</li>
                          <li>Efficiency: Gross Profit Margin, Cash Conversion Cycle, Return on Capital. </li>
                           <li>Catholic: Human Dignity, Education, Healthcare, Care for the Poor, Family Value Alignment.</li>
                           <li>Total Score: Higher AI Scores with higher Catholic Rating Alignment and Lowest Efficient Represent Top Ranked Companies Because They Have Highest Catholic AI-Efficiency Growth Opportunity. </li>

                        </ul>
                        <h3 className="system-subtitle">Supported Companies:</h3>
                        <ul className="system-list">
                          <li>Those Currently In The S&P 500</li>
                        </ul>
                        
                        <h3 className="system-subtitle">Customize Investments or Responses To Industries You're Most Interested In:</h3>
                        <p className="system-companies">
                          Tech Giants and AI Leaders, Semiconductor and Hardware, Enterprise Software and Cloud, Cybersecurity and Networking, Data and Analytics, Fintech and Payment, Ecommerce and Digital Platforms, Social Media and Entertainment, Telecom and Communication, Banking and Financial Services, Healthcare Technology, Biotech and Pharma, Industrial Technology, Automotive and Transportation, Aerospace and Defense, Retail and Consumer Technology, Energy and Utilities, Financial Market Infrastructure, Emerging Tech and AI Startups, Consumer Goods and Services
                        </p>
                      </div>
                    </div>
                    <div className="sample-prompts">
                      {samplePrompts.map((samplePrompt, index) => (
                        <div
                          key={index}
                          className="sample-prompt"
                          onClick={() => handleSamplePromptClick(samplePrompt)}
                        >
                          <div className="sample-prompt-header">Example</div>
                          <div className="sample-prompt-text">{samplePrompt}</div>
                        </div>
                      ))}
                    </div>
                    {messages.map((message, index) => (
                      <div key={index} className={`message ${message.role}`}>
                        <div className="message-content">
                          {renderMessageContent(message.content)}
                        </div>
                      </div>
                    ))}
                  </>
                )}

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
              placeholder={isOnboarding ? "Enter your response..." : "Enter new prompt ..."}
              required
              disabled={isLoading}
            ></textarea>
            {!isAuthorized && (
              <div className="chat-limit-info">
                <p>{Math.max(0, 5 - chatResponseCount)} free messages remaining</p>
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




