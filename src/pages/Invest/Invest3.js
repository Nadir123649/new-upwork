import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout, fetchUserId, initializeUserId } from '../../store/actions/userActions';
import { checkAuthStatus } from '../../store/actions/authActions';
import { updateOnboardingResponse, fetchOnboardingStatus } from '../../store/actions/onboardingActions';
import './Invest.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';
import PriceMetricsChart from '../../components/AIMetricsChart/PriceMetricsChart';
import ReactDOM from 'react-dom';

const Invest = () => {
  const { isAuthorized, userId, tempUserId, email } = useSelector((state) => state.user);
  const { isSchwabAuthenticated } = useSelector((state) => state.auth);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading Your Response. Please Wait Up To 30 Seconds.');
  const chatMessagesWrapperRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState(1);
  const [chartData, setChartData] = useState(null);
  const [stockReturns, setStockReturns] = useState(null);
  const [aiFacts, setAiFacts] = useState([]);
  const [currentOnboardingStep, setCurrentOnboardingStep] = useState(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const [error, setError] = useState(null);
  const [authUrl, setAuthUrl] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const location = useLocation();


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

  const fetchAuthUrl = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5052/initiate_auth`, {
        params: { user_id: userId || tempUserId }
      });
      setAuthUrl(response.data.auth_url);
    } catch (error) {
      console.error('Error fetching auth URL:', error);
      setError('Failed to fetch authentication URL. Please try again.');
    }
  }, [userId, tempUserId]);


  useEffect(() => {
    if (!authStatus?.is_authenticated && (userId || tempUserId)) {
      fetchAuthUrl();
    }
  }, [authStatus, userId, tempUserId, fetchAuthUrl]);

  useEffect(() => {
    if (location.state?.showSuccessPopup) {
      setShowPopup(true);
      setPopupMessage('Successfully authenticating your Schwab account. Proceed with realtime Investing');
      
      // Clear the location state
      window.history.replaceState({}, document.title);
      
      const timer = setTimeout(() => setShowPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);



  useEffect(() => {
    const fetchUserStatus = async () => {
      if (userId || tempUserId) {
        try {
          const onboardingResponse = await axios.get('http://localhost:5052/get_onboarding_status', {
            params: { user_id: userId || tempUserId }
          });
          
          console.log('Onboarding status:', onboardingResponse.data);
          
          setIsOnboarding(!onboardingResponse.data.completed);
          if (!onboardingResponse.data.completed) {
            setCurrentOnboardingStep(onboardingResponse.data.current_step);
            
            // Only add the initial question if messages are empty
            if (messages.length === 0) {
              setMessages([{ role: 'assistant', content: onboardingResponse.data.current_question }]);
            }
          }

          // Only fetch auth status if onboarding is completed
          if (onboardingResponse.data.completed) {
            const authResponse = await axios.get('http://localhost:5053/api/auth_status', {
              params: { user_id: userId || tempUserId }
            });
            setAuthStatus(authResponse.data);
          }
        } catch (error) {
          console.error('Error fetching user status:', error);
          setError('Failed to fetch user status. Please try again.');
        }
      }
    };

    fetchUserStatus();
  }, [userId, tempUserId, messages.length]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Handle submit triggered');
    console.log('Is user authorized:', isAuthorized);

    const effectiveUserId = userId || tempUserId;
    console.log('Effective user ID:', effectiveUserId);

    if (prompt.trim() && effectiveUserId) {
      console.log('Prompt is valid and effective user ID exists');
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: prompt },
      ]);
      setPrompt('');
      setIsLoading(true);
      setError(null);

      try {
        console.log('Sending invest chat request to server');
        
        // Set the timeout to 5 minutes (300000 ms) for the final onboarding step
        const timeout = currentOnboardingStep === 11 ? 300000 : 60000;
        
        if (currentOnboardingStep === 11) {
          setLoadingMessage('Executing orders. This may take up to 5 minutes. Please do not refresh the page.');
        }

        const response = await axios.post('http://localhost:5053/api/invest_chat', {
          message: prompt,
          conversation_id: conversationId,
          user_id: effectiveUserId,
          is_authorized: isAuthorized,
          is_schwab_authenticated: isSchwabAuthenticated,
          onboarding_step: currentOnboardingStep,
          auth_status: authStatus?.is_authenticated ? "authenticated" : "unauthenticated"
        }, { 
          timeout: timeout
        });

        console.log('Full API Response:', response);
        console.log('Response data:', response.data);

        const data = response.data;

        if (data.status === "authenticating") {
          setAuthUrl(data.auth_url);
          setLoadingMessage('Authentication process required');
        } else if (data.status === "completed") {
          setIsOnboarding(false);
          setCurrentOnboardingStep(null);
          setLoadingMessage('Onboarding completed');
          // Fetch auth status after onboarding is completed
          const authResponse = await axios.get('http://localhost:5053/api/auth_status', {
            params: { user_id: effectiveUserId }
          });
          setAuthStatus(authResponse.data);
        } else if (data.status === "in_progress") {
          setCurrentOnboardingStep(data.step);
          setLoadingMessage('Onboarding in progress');
        } else {
          setLoadingMessage('Loading Your Response. Please Wait Up To 30 Seconds.');
        }

        handleResponseData(data);

      } catch (error) {
        console.error('Error in invest chat request:', error);
        let errorMessage = 'An error occurred while processing your request.';
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = 'Authentication failed. Please try logging in again.';
          } else if (error.response.status >= 500) {
            errorMessage = 'A server error occurred. Please try again later.';
          }
        } else if (error.code === 'ECONNABORTED') {
          errorMessage = 'The request took too long to complete. Please try again.';
        }
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: errorMessage },
        ]);
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


  const handleResponseData = (data) => {
    console.log('Handling response data:', data);

    if (data.status === "completed") {
      console.log('Onboarding completed');
      setIsOnboarding(false);
      setCurrentOnboardingStep(null);
      // Display the success message
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.message }]);
    } else if (data.status === "in_progress") {
      console.log('Onboarding in progress');
      setCurrentOnboardingStep(data.step);
    }

    if (data.status === "authenticating") {
      console.log('Authentication process required');
    } else if (data.status === "completed") {
      console.log('Onboarding completed');
      setIsOnboarding(false);
      setCurrentOnboardingStep(null);
    } else if (data.status === "in_progress") {
      console.log('Onboarding in progress');
      setCurrentOnboardingStep(data.step);
    }

    if (data.message) {
      console.log('Adding new message to chat');
      setMessages(prevMessages => {
        // Check if the last message is different from the new message
        if (prevMessages.length === 0 || prevMessages[prevMessages.length - 1].content !== data.message) {
          return [...prevMessages, { role: 'assistant', content: data.message }];
        }
        return prevMessages;
      });

    } else {
      console.error('Response does not contain expected data:', data);
      setError('Received an unexpected response from the server.');
    }

    if (data.stock_returns) setStockReturns(data.stock_returns);
    if (data.additional_data?.ai_facts) setAiFacts(data.additional_data.ai_facts);
    if (data.chart_data) setChartData(data.chart_data);
  };

  const renderMessageContent = (content) => {
    if (!content) return <p>No content available</p>;

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
    { title: "Portfolio Positions", text: "What are my existing portfolio positions?" },
    { title: "Trade Execution", text: "LasVegas Sands had bad Catholic AI News Today. I'd like to close my position." },
    { title: "Account Balance", text: "How much cash do I have in my account?" }
  ];

  const handleSamplePromptClick = (promptText) => {
    setPrompt(promptText);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="invest">
      <div className="invest-content">
        <Header />
        <div className="invest-container">
          <Navbar />
          <div className="invest-main">
            <div className="invest-messages-wrapper">
              <div className="invest-messages" ref={chatMessagesWrapperRef}>
                {isOnboarding ? (
                  <div className="message assistant">
                    <div className="message-content">
                      {messages.length > 0 ? renderMessageContent(messages[messages.length - 1].content) : null}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="message assistant">
                      <div className="message-content system-message">
                        <h2 className="system-title">Realtime Investing Agent</h2>
                        <p className="system-description">
                          Your realtime portfolio is invested. Ask about portfolio company information related to Catholic AI Efficiency metrics, account information such as balances, positions, or performance, and execute individual trades if you'd like outside the periodic rebalancing that will be completed. Chat here anytime and receive email updates from us.      
                        </p>
                      </div>
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
      <form onSubmit={handleSubmit} className="invest-form">
        <div className="invest-form-inner">
          <div className="textarea-container">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}  // Change this line from onKeyPress to onKeyDown
              placeholder={isOnboarding ? "Enter your response..." : "Enter new prompt ..."}
              required
              disabled={isLoading}
            ></textarea>
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
        <div className="popup success">
          <p>{popupMessage}</p>
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}      
    </div>
  );
};

export default Invest;

