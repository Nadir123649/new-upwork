import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
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
import OptimalPortfolio from '../../components/OptimalPortfolio/OptimalPortfolio';
import '../../components/OptimalPortfolio/OptimalPortfolio.css';
import OnboardingQuestion from '../../components/OnboardingQuestion/OnboardingQuestion';
import { XMLParser } from 'fast-xml-parser';
import { API_ENDPOINTS } from '../../config/api';

const Invest = () => {
  const { isAuthorized, userId, tempUserId, email } = useSelector((state) => state.user);
  const { isSchwabAuthenticated } = useSelector((state) => state.auth);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
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

  // New state variables for starting cash functionality
  const [userPoints, setUserPoints] = useState(0);
  const [additionalCapital, setAdditionalCapital] = useState(0);
  const [totalInvestmentAmount, setTotalInvestmentAmount] = useState(0);

  // New state variables for optimal portfolio
  const [optimalPortfolio, setOptimalPortfolio] = useState(null);
  const [portfolioSummary, setPortfolioSummary] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const sectorPeerGroupMap = {
    'Technology': 'tech_giants_and_ai_leaders',
    'Financials': 'banking_and_financial_services',
    'Healthcare': 'biotech_and_pharma'
  };

  const filterNoContent = (content) => {
    return content && content.trim() !== 'No content available' ? content : null;
  };

  const urlMap = {
    'https://www.schwab.com/open-an-account': 'www.schwab.com/open-account',
    'https://client.schwab.com/app/trade/tradingtools/#/home/agreementprocess': 'www.schwab.com/agreementprocess',
  };

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
    if (currentOnboardingStep === 2) {
      fetchUserPoints();
    }
  }, [currentOnboardingStep]);

  const fetchAuthUrl = useCallback(async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.INITIATE_AUTH, {
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
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setShowPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (userId || tempUserId) {
        try {
          const onboardingResponse = await axios.get(API_ENDPOINTS.GET_ONBOARDING_STATUS, {
            params: { user_id: userId || tempUserId }
          });

          console.log('Onboarding status:', onboardingResponse.data);
          
          setIsOnboarding(!onboardingResponse.data.completed);
          if (!onboardingResponse.data.completed) {
            setCurrentOnboardingStep(onboardingResponse.data.current_step);
            
            if (messages.length === 0) {
              setMessages([{ role: 'assistant', content: onboardingResponse.data.current_question }]);
            }
          }

          if (onboardingResponse.data.completed) {
            const authResponse = await axios.get(API_ENDPOINTS.AUTH_STATUS, {
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

  const fetchUserPoints = async () => {
    try {
      const effectiveUserId = userId || tempUserId;
      const response = await axios.get(`${API_ENDPOINTS.GET_USER_POINTS}/${effectiveUserId}`);
      setUserPoints(response.data.points);
      setTotalInvestmentAmount(response.data.points);
    } catch (error) {
      console.error('Error fetching user points:', error);
      setError('Failed to fetch user points. Please try again.');
    }
  };

  const handleAdditionalCapitalChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    setAdditionalCapital(value);
    setTotalInvestmentAmount(userPoints + value);
  };

  const handleBeginClick = () => {
    handleSubmit({ preventDefault: () => {} }, 'Begin');
  };

  const handleSectorClick = (sector) => {
    const peerGroup = sectorPeerGroupMap[sector];
    handleSubmit({ preventDefault: () => {} }, `100% ${peerGroup}`);
  };

  const handleProceedClick = () => {
    if (totalInvestmentAmount >= 5) {
      handleSubmit({ preventDefault: () => {} }, `${totalInvestmentAmount}`);
    }
  };

  const handleRemoveStock = (symbol) => {
    handleSubmit({ preventDefault: () => {} }, `REMOVE_SYMBOL_${symbol}`);
  };

  const handleAddStock = () => {
    if (newSymbol) {
      handleSubmit({ preventDefault: () => {} }, `ADD_SYMBOL_${newSymbol}`);
      setNewSymbol('');
    }
  };

  const handleProceedToSchwab = () => {
    handleSubmit({ preventDefault: () => {} }, 'PROCEED_TO_AUTHENTICATION');
  };

  const handleExecutePortfolio = () => {
    setShowConfirmation(true);
  };

  const handleConfirmExecution = () => {
    handleSubmit({ preventDefault: () => {} }, 'EXECUTE');
    setShowConfirmation(false);
  };

  const handleSubmit = async (e, overridePrompt = null) => {
    e.preventDefault();
    console.log('Handle submit triggered');
    console.time('handleSubmit');

    const effectiveUserId = userId || tempUserId;
    console.log('Effective user ID:', effectiveUserId);

    const submittedPrompt = overridePrompt || prompt;

    if ((submittedPrompt.trim() || overridePrompt) && effectiveUserId) {
      console.log('Prompt is valid and effective user ID exists');
      
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: submittedPrompt },
      ]);
      setPrompt('');
      setIsLoading(true);
      setError(null);

      try {
        console.log('Sending invest chat request to server');
        console.time('apiRequest');
                    
        const timeout = isOnboarding && currentOnboardingStep === 11 ? 300000 : 220000;

        if (isOnboarding && currentOnboardingStep === 11) {
          setLoadingMessage('Executing orders. This may take up to 5 minutes. Please do not refresh the page.');
        } else {
          setLoadingMessage(`Thanks, we're saving your progress and loading the next onboarding question.`);
        }

        const response = await axios.post(API_ENDPOINTS.INVEST_CHAT, {
          message: submittedPrompt,
          conversation_id: conversationId,
          user_id: effectiveUserId,
          is_authorized: isAuthorized,
          is_schwab_authenticated: isSchwabAuthenticated,
          onboarding_step: currentOnboardingStep,
          auth_status: authStatus?.is_authenticated ? "authenticated" : "unauthenticated",
          total_investment_amount: totalInvestmentAmount
        }, { 
          timeout: timeout
        });

        console.timeEnd('apiRequest');
        console.log('Full API Response:', response);

        const data = response.data;
        console.log('Response data:', data);

        console.time('handleResponseData');
        handleResponseData(data);
        console.timeEnd('handleResponseData');

      } catch (error) {
        console.error('Error in invest chat request:', error);
        // ... (keep existing error handling)
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  useEffect(() => {
    if (!isOnboarding) {
      setLoadingMessage('');
    }
  }, [isOnboarding]);

  const handleResponseData = (data) => {
    console.log('Handling response data:', data);
    if (data.status === "success" && data.data && data.data.sections) {
      // ... (keep existing portfolio analysis handling)
    } else if (data.optimal_portfolio) {
      setOptimalPortfolio(data.optimal_portfolio);
      setPortfolioSummary(data.portfolio_summary);
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

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_"
  });

  const parsedXML = useMemo(() => {
    const lastMessage = messages[messages.length - 1]?.content;
    if (typeof lastMessage === 'string' && lastMessage.includes('<onboarding_response>')) {
      console.log("Parsing XML-structured onboarding response");
      console.time('xmlParsing');
      const result = parser.parse(`<root>${lastMessage}</root>`);
      console.timeEnd('xmlParsing');
      return result;
    }
    return null;
  }, [messages]);

  const renderMessageContent = useCallback((content) => {  
    if (React.isValidElement(content)) {
      return content;
    }

    console.log("renderMessageContent called with content:", content);
    console.time('renderMessageContent');

    const replaceUrls = (text) => {
      let replacedText = text;
      Object.entries(urlMap).forEach(([longUrl, shortUrl]) => {
        const regex = new RegExp(longUrl, 'g');
        replacedText = replacedText.replace(regex, `<a href="${longUrl}" target="_blank">${shortUrl}</a>`);
      });

      const authUrlRegex = /https:\/\/api\.schwabapi\.com\/v1\/oauth\/authorize\S+/g;
      replacedText = replacedText.replace(authUrlRegex, (match) => {
        return `<a href="${match}" target="_blank">www.schwab.com/authenticate</a>`;
      });

      return replacedText;
    };

    const renderOnboardingResponse = (parsedXML) => {
      console.log("Rendering onboarding response from parsed XML");
      console.time('renderOnboardingResponse');
      const responses = parsedXML.root.onboarding_response;
      
      const renderResponse = (response, index) => (
        <React.Fragment key={index}>
          {response.summary && <div className="onboarding-summary" dangerouslySetInnerHTML={{ __html: replaceUrls(response.summary) }} />}
          {response.question && (
            <OnboardingQuestion 
              questionData={{
                title: response.question.title,
                content: Array.isArray(response.question.content.item) 
                  ? response.question.content.item.map(replaceUrls)
                  : [replaceUrls(response.question.content.item)]
              }}
            />
          )}
          {response.portfolio_summary && <div className="portfolio-summary" dangerouslySetInnerHTML={{ __html: replaceUrls(response.portfolio_summary) }} />}
          {response.auth_link && <div className="auth-link"><a href={response.auth_link} target="_blank" rel="noopener noreferrer">Authenticate</a></div>}
          {currentOnboardingStep === 1 && (
            <button className="begin-button" onClick={handleBeginClick}>Begin</button>
          )}
          {currentOnboardingStep === 2 && (
            <div className="starting-cash-input">
              <p>Investment dollars from point conversion: ${userPoints}</p>
              <label htmlFor="additional-capital">Additional capital:</label>
              <input
                type="number"
                id="additional-capital"
                value={additionalCapital}
                onChange={handleAdditionalCapitalChange}
                min="0"
                step="1"
              />
              <p>Total investment amount: ${totalInvestmentAmount}</p>
              {totalInvestmentAmount < 5 ? (
                <p className="error-message">You need at least $5 to proceed.</p>
              ) : (
                <button className="proceed-button" onClick={handleProceedClick}>Proceed</button>
              )}
            </div>
          )}
          {currentOnboardingStep === 3 && (
            <div className="sector-buttons">
              {Object.keys(sectorPeerGroupMap).map((sector) => (
                <button key={sector} className="sector-button" onClick={() => handleSectorClick(sector)}>
                  {sector}
                </button>
              ))}
            </div>
          )}
          {currentOnboardingStep === 4 && optimalPortfolio && (
            <div className="optimal-portfolio">
              <h3>Optimal Portfolio</h3>
              <div dangerouslySetInnerHTML={{ __html: portfolioSummary }} />
              <div className="stock-actions">
                {optimalPortfolio.map((stock) => (
                  <button key={stock.symbol} onClick={() => handleRemoveStock(stock.symbol)}>
                    Remove {stock.symbol}
                  </button>
                ))}
              </div>
              <div className="add-stock">
                <input
                  type="text"
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  placeholder="Enter stock symbol"
                />
                <button onClick={handleAddStock}>Add Stock</button>
              </div>
              <button className="proceed-button" onClick={handleProceedToSchwab}>
                Proceed to Connect Schwab and Execute Orders
              </button>
            </div>
          )}
          {currentOnboardingStep === 5 && (
            <div className="authentication-step">
              <button onClick={handleExecutePortfolio}>
                Execute Optimal Portfolio
              </button>
            </div>
          )}
        </React.Fragment>
      );

      const result = (
        <div className="onboarding-response">
          {Array.isArray(responses) ? responses.map(renderResponse) : renderResponse(responses, 0)}
        </div>
      );
      console.timeEnd('renderOnboardingResponse');
      return result;
    };

    let result;
    if (parsedXML && content === messages[messages.length - 1]?.content) {
      result = renderOnboardingResponse(parsedXML);
    } else if (typeof content === 'object') {
      console.log("Rendering object content");
      result = <pre>{JSON.stringify(content, null, 2)}</pre>;
    } else {
      console.log("Rendering plain text content");
      result = <p dangerouslySetInnerHTML={{ __html: replaceUrls(String(content)) }} />;
    }

    console.timeEnd('renderMessageContent');
    return result;
  }, [parsedXML, messages, currentOnboardingStep, handleBeginClick, handleSectorClick, userPoints, additionalCapital, totalInvestmentAmount, handleProceedClick, optimalPortfolio, portfolioSummary, newSymbol, handleRemoveStock, handleAddStock, handleProceedToSchwab, handleExecutePortfolio]);

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
          <form onSubmit={handleSubmit} className="invest-form">
            <div className="invest-form-inner">
              <div className="textarea-container">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
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
        </div>
      </div>
      {showPopup && (
        <div className="popup success">
          <p>{popupMessage}</p>
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}
      {showConfirmation && (
        <div className="confirmation-popup">
          <h3>Confirm Execution</h3>
          <div dangerouslySetInnerHTML={{ __html: portfolioSummary }} />
          <button onClick={handleConfirmExecution}>Confirm and Execute</button>
          <button onClick={() => setShowConfirmation(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Invest;

