import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { initiateSchwabAuth } from '../../store/actions/authActions';
import WebsiteTour from '../../components/WebsiteTour/WebsiteTour';
import { API_ENDPOINTS } from '../../config/api';




const Chat = () => {
  const { isAuthorized, userId, tempUserId, email } = useSelector((state) => state.user);
  const { isSchwabAuthenticated } = useSelector((state) => state.auth);
  const { step: onboardingStep, question: onboardingQuestion, completed: onboardingCompleted } = useSelector((state) => state.onboarding);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

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
  const [showInvestingCTA, setShowInvestingCTA] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const effectiveUserId = userId || tempUserId;

  useEffect(() => {
    if (userId && userId > 4000) {
      setShowTour(true);
    }
  }, [userId]);

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
    const fetchDailyUpdate = async () => {
      if (userId && userId < 4000) {
        try {
          const response = await axios.get(API_ENDPOINTS.DAILY_UPDATE, {
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
      const effectiveUserId = userId || tempUserId;
      if (effectiveUserId && !isAuthorized) {
        try {
          const countResponse = await axios.get(API_ENDPOINTS.CHAT_RESPONSE_COUNT, {

            params: { user_id: effectiveUserId }
          });
          console.log('Chat response count:', countResponse.data.count);
          setChatResponseCount(countResponse.data.count);
        } catch (error) {
          console.error('Error fetching chat response count:', error);
        }
      }
    };

    fetchStatus();
  }, [userId, tempUserId, isAuthorized]);

  const handleCloseCTA = () => {
    setShowInvestingCTA(false);
  };

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
          const response = await axios.get(API_ENDPOINTS.CHECK_AUTH_COMPLETION, {
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
      intervalId = setInterval(checkAuthCompletion, 5000);
      timeoutId = setTimeout(() => {
        setIsCheckingAuth(false);
        clearInterval(intervalId);
        setMessages(prevMessages => [
          ...prevMessages,
          { role: 'assistant', content: 'Authentication process timed out. Please try again.' }
        ]);
      }, 300000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [userId, isOnboarding, isCheckingAuth]);

  const fetchAuthData = async (userId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.GET_AUTH_DATA, {    

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
      dispatch(checkAuthStatus(userId));
      fetchAuthData(userId);
    } else if (authStatus === 'error') {
      console.error('Schwab authentication failed');
      setMessages(prevMessages => [
        ...prevMessages,
        { role: 'assistant', content: 'Schwab authentication failed. Please try again.' }
      ]);
    }
  }, [location, dispatch]);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const { data } = await axios.get(API_ENDPOINTS.GET_CONVERSATION, {
  
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
      
      if (!isAuthorized && chatResponseCount >= 3) {
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
        const response = await axios.post(API_ENDPOINTS.CHAT, {

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

        if (data.onboarding_step === 'ready_to_authenticate') {
          setLoadingMessage('Creating optimal portfolio wait 3 minutes');
        } else {
          setLoadingMessage(`Thanks for your input "${prompt}". We're gathering the results.`);
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
    console.log('Handling response data:', data);
    if (data.status === "success" && data.data && data.data.sections) {
      console.log('Handling portfolio analysis response');
      console.log('Sections:', data.data.sections);

      try {
        const xmlContent = data.data.sections[0].content.replace(/```xml|```/g, '').trim();
        console.log('XML content to parse:', xmlContent);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

        if (xmlDoc.querySelector("parsererror")) {
          throw new Error('XML parsing failed');
        }

        const symbol = xmlDoc.querySelector('symbol')?.textContent || 'Unknown Symbol';
        console.log('Symbol:', symbol);

        const analysisMessage = (
          <div className="portfolio-analysis">
            <h2>{symbol} Portfolio Analysis</h2>
            {Array.from(xmlDoc.querySelectorAll('sections > section')).map((section, index) => (
              <div key={index} className="analysis-section">
                <h3>{section.querySelector('title')?.textContent || `Section ${index + 1}`}</h3>
                <p>{section.querySelector('content')?.textContent?.trim() || ''}</p>
                {section.querySelector('products') && (
                  <div className="product-analysis">
                    <h4>AI Products</h4>
                    {Array.from(section.querySelectorAll('product')).map((product, productIndex) => (
                      <div key={productIndex} className="product">
                        <h5>{product.querySelector('name')?.textContent}</h5>
                        <p><strong>Explanation:</strong> {product.querySelector('explanation')?.textContent}</p>
                        <p><strong>Impact:</strong> {product.querySelector('impact')?.textContent}</p>
                      </div>
                    ))}
                  </div>
                )}
                {section.querySelector('subsections') && (
                  <div className="subsections">
                    {Array.from(section.querySelectorAll('subsection')).map((subsection, subIndex) => (
                      <div key={subIndex} className="subsection">
                        <h4>{subsection.querySelector('title')?.textContent}</h4>
                        {subsection.querySelector('metrics') && (
                          <div className="metrics">
                            <ul>
                              {Array.from(subsection.querySelectorAll('metric')).map((metric, metricIndex) => (
                                <li key={metricIndex} className="metric">
                                  <div className="metric-header">
                                    <span className="metric-name">{metric.querySelector('name')?.textContent}:</span>
                                    <span className="metric-value">
                                      {parseFloat(metric.querySelector('value')?.textContent).toFixed(2)}
                                    </span>
                                    <span className="metric-weight">
                                      (weight: {parseFloat(metric.querySelector('weight')?.textContent).toFixed(2)})
                                    </span>
                                  </div>
                                  {metric.querySelector('explanation') && (
                                    <p className="metric-explanation">{metric.querySelector('explanation')?.textContent}</p>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {subsection.querySelector('calculation') && (
                          <div className="calculation">
                            <p>Calculation: {subsection.querySelector('calculation')?.textContent}</p>
                            {subsection.querySelector('result') && (
                              <p><strong>Result:</strong> {parseFloat(subsection.querySelector('result')?.textContent).toFixed(2)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {xmlDoc.querySelector('rankings') && (
              <div className="rankings">
                <h3>Rankings</h3>
                <ul>
                  {Array.from(xmlDoc.querySelectorAll('rankings > *')).map((ranking, index) => (
                    <li key={index}>
                      <strong>{ranking.tagName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong>
                      <span>{ranking.textContent}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
        console.log('Generated analysis message:', analysisMessage);
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: analysisMessage }]);
      } catch (error) {
        console.error('Error processing XML:', error);
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: `Failed to process analysis: ${error.message}` }]);
      }
    } else if (data.message) {
      console.log('Adding new message to chat:', data.message);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.message }]);
    } else {
      console.error('Response does not contain expected data:', data);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Received an unexpected response from the server.' }]);
    }

    if (data.stock_returns) setStockReturns(data.stock_returns);
    if (data.additional_data?.ai_facts) setAiFacts(data.additional_data.ai_facts);
    if (data.chart_data) setChartData(data.chart_data);
  };


  const renderMessageContent = useCallback((content) => {
    if (!content) {
      console.error('No content provided to renderMessageContent');
      return <p>No content available</p>;
    }

    console.log('Content received in renderMessageContent:', content);

    if (React.isValidElement(content)) {
      return content;
    }

    if (typeof content === 'string') {
      return <p>{content}</p>;
    }

    if (typeof content === 'object') {
      return <pre>{JSON.stringify(content, null, 2)}</pre>;
    }

    return <p>{String(content)}</p>;
  }, []);



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
    { title: "Rankings within Peer Group and S&P 500", text: "Tesla's Overall Catholic Generative AI Ranking" },
    { title: "View of Detailed Metrics For A Company", text: "Explain Boeing's AI, Catholic, and Efficiency Scores." },
    { title: "Transparent Scoring System", text: "Explain the detailed calculations in Goldman Sachs Overall Score." }
  ];

  const handleSamplePromptClick = (promptText) => {
    setPrompt(promptText);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="chat">
      {effectiveUserId && <WebsiteTour userId={effectiveUserId} />}
      <div className="chat-content">
        <Header />
        <div className="chat-container">
          <Navbar />
          <div className="chat-main">
            {showInvestingCTA && (
              <div className="investing-cta">
                <button className="close-cta" onClick={handleCloseCTA}>&times;</button>
                <h3>Ready to create your realtime portfolio?</h3>
                <p>5 minutes to create your optimal Catholic GenAI Portfolio and Agent!</p>
                <Link to="/signup" className="start-investing-btn">Start Investing</Link>
              </div>
            )}
            <div className="chat-messages-wrapper">
              <div className="chat-messages" ref={chatMessagesWrapperRef}>
                <div className="message assistant">
                  <div className="message-content system-message">
                    <h2 className="system-title">Catholic Generative AI Efficiency Index</h2>
                    <p className="system-description">
                      Provide a query about a public company or generative AI metric. Subscribed realtime investing users can access Schwab trading functionality in the investing agent page.       
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
                      {renderMessageContent(message.content)}
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
              placeholder={isOnboarding ? "Enter your response..." : "Enter new prompt ..."}
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





