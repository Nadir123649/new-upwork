
import React, { useState, useEffect, useRef } from 'react';
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
  const [currentOnboardingQuestion, setCurrentOnboardingQuestion] = useState('');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const [error, setError] = useState(null);
  const [initialQuestionDisplayed, setInitialQuestionDisplayed] = useState(false);


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


  useEffect(() => {
    const checkAuthAndOnboardingStatus = async () => {
      if (userId) {
        try {
          // Check authentication status
          const authResponse = await axios.get('http://localhost:5053/api/auth_status', {
            params: { user_id: userId }
          });
          setAuthStatus(authResponse.data);

          // Check onboarding status
          const onboardingResponse = await axios.get('http://localhost:5053/get_onboarding_status', {
            params: { user_id: userId }
          });
          
          console.log('Onboarding status:', onboardingResponse.data);
          
          setIsOnboarding(!onboardingResponse.data.completed);
          if (!onboardingResponse.data.completed) {
            setCurrentOnboardingStep(onboardingResponse.data.current_step);
            setCurrentOnboardingQuestion(onboardingResponse.data.current_question);
            
            // Only add the initial question if it hasn't been displayed yet
            if (!initialQuestionDisplayed) {
              setMessages([{ role: 'assistant', content: onboardingResponse.data.current_question }]);
              setInitialQuestionDisplayed(true);
            }
          }
        } catch (error) {
          console.error('Error fetching auth or onboarding status:', error);
          setError('Failed to fetch user status. Please try again.');
        }
      }
    };

    checkAuthAndOnboardingStatus();
  }, [userId, initialQuestionDisplayed]);


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
        const response = await axios.post('http://localhost:5053/api/invest_chat', {
          message: prompt,
          conversation_id: conversationId,
          user_id: effectiveUserId,
          is_authorized: isAuthorized,
          is_schwab_authenticated: isSchwabAuthenticated,
          onboarding_step: currentOnboardingStep,
          auth_status: authStatus.is_authenticated ? "authenticated" : "unauthenticated"
        }, { 
          timeout: 600000 // 10 minutes
        });

        console.log('Full API Response:', response);
        console.log('Response data:', response.data);

        const data = response.data;

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

      } catch (error) {
        console.error('Error in invest chat request:', error);
        let errorMessage = 'An error occurred while processing your request.';
        if (error.response) {
          if (error.response.status === 401) {
            errorMessage = 'Authentication failed. Please try logging in again.';
          } else if (error.response.status >= 500) {
            errorMessage = 'A server error occurred. Please try again later.';
          }
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


  const handleResponseData = (data) => {
    console.log('Handling response data:', data);

    if (data.status === "authenticating") {
      // Handle authentication process
      console.log('Authentication process required');
    } else if (data.status === "completed") {
      console.log('Onboarding completed');
      setIsOnboarding(false);
      setCurrentOnboardingStep(null);
      setCurrentOnboardingQuestion('');
    } else if (data.status === "in_progress") {
      console.log('Onboarding in progress');
      setCurrentOnboardingStep(data.step);
      setCurrentOnboardingQuestion(data.message);
      
      // Only add the new message if it's different from the last message
      setMessages((prevMessages) => {
        if (prevMessages.length === 0 || prevMessages[prevMessages.length - 1].content !== data.message) {
          return [...prevMessages, { role: 'assistant', content: data.message }];
        }
        return prevMessages;
      });
    }

    if (data.message && data.status !== "in_progress") {
      console.log('Adding new message to chat');
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: data.message },
      ]);
    } else if (!data.message) {
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
                {!authStatus?.is_authenticated ? (
                  <div className="message assistant">
                    <div className="message-content">
                      {authStatus?.needs_reauthentication ? (
                        <p>Re-authentication is needed. Please click <a href={authStatus.auth_url}>here</a> to re-authenticate.</p>
                      ) : (
                        <p>Your account is not connected. Please go to <a href="www.connect.com">www.connect.com</a> to connect your account.</p>
                      )}
                    </div>
                  </div>
                ) : isOnboarding ? (
                  <>
                    <div className="message assistant">
                      <div className="message-content">
                        {renderMessageContent(currentOnboardingQuestion)}
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
                ) : (
                  <>
                    <div className="message assistant">
                      <div className="message-content system-message">
                        <h2 className="system-title">Realtime Investing Agent</h2>
                        <p className="system-description">
                          Chat with your brokerage account details and trade executions. Ask about existing portfolio information, trades you'd like to execute, or performance analysis.     
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
              placeholder={isOnboarding ? "Enter your response..." : "Enter new prompt ..."}
              required
              disabled={isLoading || !authStatus?.is_authenticated}
            ></textarea>
          </div>
          <button type="submit" disabled={isLoading || !authStatus?.is_authenticated}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Invest;