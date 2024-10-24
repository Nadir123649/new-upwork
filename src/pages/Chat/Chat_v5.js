import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout, fetchUserId } from '../../store/actions/userActions';
import './Chat.css';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';
import PriceMetricsChart from '../../components/AIMetricsChart/PriceMetricsChart';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import { checkAuthStatus } from '../../store/actions/authActions';
import { initializeUserId } from '../../store/actions/userActions';
import { updateOnboardingResponse } from '../../store/actions/onboardingActions';

const Chat = () => {
  const { isAuthorized, userId, email } = useSelector((state) => state.user);
  const { isSchwabAuthenticated } = useSelector((state) => state.auth);
  const { step: onboardingStep, question: onboardingQuestion, completed: onboardingCompleted } = useSelector((state) => state.onboarding);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    const fetchStatus = async () => {
      if (userId) {
        try {
          const response = await axios.get('http://localhost:5052/get_onboarding_status', {
            params: { user_id: userId }
          });
          dispatch({ 
            type: 'SET_ONBOARDING_STATUS', 
            payload: {
              step: response.data.current_step,
              question: response.data.current_question,
              completed: response.data.completed
            }
          });
        } catch (error) {
          console.error('Error fetching onboarding status:', error);
        }
      }
    };

    fetchStatus();

    // Set up an interval to fetch the status every 30 seconds
    const intervalId = setInterval(fetchStatus, 30000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [userId, dispatch]);


  useEffect(() => {
    if (onboardingStep && !onboardingCompleted) {
      setMessages([{ role: 'assistant', content: onboardingQuestion }]);
    }
  }, [onboardingStep, onboardingQuestion, onboardingCompleted]);


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
      chatMessagesWrapperRef.current.scrollTop = chatMessagesWrapperRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
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
    if (prompt.trim() && userId) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: prompt },
      ]);
      setPrompt('');
      setIsLoading(true);

      try {
        if (!onboardingCompleted) {
          await dispatch(updateOnboardingResponse(onboardingStep, prompt, userId));
          // Fetch the updated onboarding status
          const response = await axios.get('http://localhost:5052/get_onboarding_status', {
            params: { user_id: userId }
          });
          dispatch({ 
            type: 'SET_ONBOARDING_STATUS', 
            payload: {
              step: response.data.current_step,
              question: response.data.current_question,
              completed: response.data.completed
            }
          });
        } else {
          const { data } = await axios.post('http://localhost:5052/chat', {
            message: prompt,
            conversation_id: conversationId,
            user_id: userId,
            is_authorized: isAuthorized,
            is_schwab_authenticated: isSchwabAuthenticated,
          }, { timeout: 180000 });



          if (data.response) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { role: 'assistant', content: data.response },
            ]);
          } else if (data.error) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { role: 'assistant', content: `Error: ${data.error}` },
            ]);
          }

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
        }
      } catch (error) {
        console.error('Error:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: 'An error occurred while processing your request.' },
        ]);
      }

      setIsLoading(false);
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

  const renderMessageContent = (content) => {
    if (!content) {
      return <p>No content available</p>;
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
      return cleanedContent.split('\n').map((line, lineIndex) => (
        <p key={lineIndex}>{line}</p>
      ));
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
    "Explain Apple's AI Hiring and Workforce Trends.",
    "What is Adobe's AI R&D budget? How do they plan to spend the funds.",
    "Does Boeing have an AI Ethics board?"
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
            <div className="chat-messages-wrapper" ref={chatMessagesWrapperRef}>
              <div className="chat-messages">
                {isAuthorized && !onboardingCompleted && (
                  <div className="message assistant">
                    <div className="message-content">
                      <p>Welcome to the onboarding process. Please answer the following questions to set up your account.</p>
                    </div>
                  </div>
                )}
                {isAuthorized && !isSchwabAuthenticated && (
                  <div className="message assistant">
                    <div className="message-content">
                      <p>Your Schwab account is not connected. Please connect your Schwab account to access all features.</p>
                    </div>
                  </div>
                )}
                {(!isAuthorized || onboardingCompleted) && (
                  <div className="message assistant">
                    <div className="message-content system-message">
                      <h2 className="system-title">AI Facts Research Guideline</h2>
                      <p className="system-description">
                        Provide a specific AI investment query about any of the topics and companies listed below. Your query MUST contain exactly ONE company name and ONE AI category due to current functionality limitations. Report generation takes approximately 3 minutes. Must MANUALLY scroll down after clicking submit to access research! 
                      </p>
                      
                      <h3 className="system-subtitle">AI Categories:</h3>
                      <ul className="system-list">
                        <li>AI Products & Services (e.g., number of AI products, market size, users)</li>
                        <li>AI Research & Development (e.g., research budget, publications, patents)</li>
                        <li>AI Impact on Business Operations (e.g., cost savings, revenue increase, margin improvement)</li>
                        <li>AI Future Plans & Strategy (e.g., planned investment amount)</li>
                        <li>AI Ethics & Governance (e.g., ethical guidelines, policy participation, ethics board)</li>
                        <li>AI Financials & Investments (e.g., investment expenses, acquisitions, value of acquisitions)</li>
                        <li>AI Partnerships & Ecosystems (e.g., number of partnerships, value of partnership deals)</li>
                        <li>AI Talent & Workforce (e.g., number of AI-specific roles, planned hires, compensation)</li>
                      </ul>
                      
                      <h3 className="system-subtitle">Supported Companies:</h3>
                      <p className="system-companies">
                        Apple, Microsoft, Amazon, Google, Berkshire Hathaway, Facebook, Tesla, Nvidia, JPMorgan Chase, Johnson & Johnson, Visa, Procter & Gamble, UnitedHealth Group, Home Depot, Mastercard, Bank of America, Disney, Comcast, Pfizer, Adobe, Netflix, Cisco, Merck, PepsiCo, Thermo Fisher Scientific, Costco, Broadcom, Abbott Laboratories, Accenture, Danaher, Medtronic, Coca-Cola, Verizon, Eli Lilly, Salesforce, McDonald's, Qualcomm, Honeywell, Goldman Sachs, Amgen, NextEra Energy, Lowe's, Boeing, Union Pacific, Intel, United Parcel Service, Texas Instruments, Starbucks, Lockheed Martin, Intuit, Caterpillar
                      </p>
                    </div>
                  </div>
                )}
                {(!isAuthorized || onboardingCompleted) && (

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
                )}
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
                      <p>Loading Your AI Facts Research. Please Wait Up To 3 Minutes.</p>
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
            placeholder={isAuthorized && !onboardingCompleted ? onboardingQuestion : "Enter new prompt ..."}
            required
            disabled={isLoading}
          ></textarea>
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

