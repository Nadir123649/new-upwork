import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout, fetchUserId, initializeUserId } from '../../store/actions/userActions';
import { checkAuthStatus } from '../../store/actions/authActions';
import { updateOnboardingResponse, fetchOnboardingStatus } from '../../store/actions/onboardingActions';
import './Invest.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import PriceMetricsChart from '../../components/AIMetricsChart/PriceMetricsChart';
import ReactDOM from 'react-dom';
import OptimalPortfolio from '../../components/OptimalPortfolio/OptimalPortfolio';
import '../../components/OptimalPortfolio/OptimalPortfolio.css';
import OnboardingQuestion from '../../components/OnboardingQuestion/OnboardingQuestion';
import { XMLParser } from 'fast-xml-parser';
import { API_ENDPOINTS } from '../../config/api';
import { FaChartLine, FaMoneyBillWave, FaCross, FaRobot, FaInfoCircle } from 'react-icons/fa';

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
  const [researchResponseCount, setResearchResponseCount] = useState(0);
  const [authData, setAuthData] = useState(null);

  const [userPoints, setUserPoints] = useState(0);
  const [additionalCapital, setAdditionalCapital] = useState(0);
  const [totalInvestmentAmount, setTotalInvestmentAmount] = useState(0);

  const [optimalPortfolio, setOptimalPortfolio] = useState(null);
  const [portfolioSummary, setPortfolioSummary] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const sectorPeerGroupMap = {
    'Technology': 'tech_giants_and_ai_leaders',
    'Financials': 'banking_and_financial_services',
    'Healthcare': 'biotech_and_pharma'
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

  useEffect(() => {
    console.log('Current onboarding step updated:', currentOnboardingStep);
  }, [currentOnboardingStep]);

  const parseXML = (xmlString) => {
    const parser = new DOMParser();
    return parser.parseFromString(xmlString, "text/xml");
  };

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


  const handleConvertPoints = async () => {
    try {
      const effectiveUserId = userId || tempUserId;
      const response = await axios.post(API_ENDPOINTS.CONVERT_POINTS, {
        userId: effectiveUserId,
        points: userPoints,
        schwabAccountNumber: "YOUR_SCHWAB_ACCOUNT_NUMBER" // You'll need to get this from somewhere
      });
      setUserPoints(0);
      setTotalInvestmentAmount(response.data.dollarsEarned);
      setAdditionalCapital(response.data.dollarsEarned);
      // You might want to show a success message here
      setPopupMessage(`Successfully converted ${userPoints} points to $${response.data.dollarsEarned}`);
      setShowPopup(true);
    } catch (error) {
      console.error('Error converting points:', error);
      setError('Failed to convert points. Please try again.');
    }
  };


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
      
      if (!isAuthorized && researchResponseCount >= 3) {
        console.log('Unauthorized user has reached message limit');
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'user', content: submittedPrompt },
          { role: 'assistant', content: 'Limit reached. Please register an account to continue using the research.' },
        ]);
        setPrompt('');
        return;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: submittedPrompt },
      ]);
      setPrompt('');
      setIsLoading(true);
      setError(null);

      try {
        console.log('Sending research request to server');
        console.time('apiRequest');
        
        const response = await axios.post(API_ENDPOINTS.INVEST_CHAT, {
          message: submittedPrompt,
          conversation_id: conversationId,
          user_id: effectiveUserId,
          is_authorized: isAuthorized,
          is_schwab_authenticated: isSchwabAuthenticated,
          onboarding_step: currentOnboardingStep,
          verification_code: authData ? authData.verification_code : null
        }, { 
          timeout: 600000 // 10 minutes
        });

        console.timeEnd('apiRequest');
        console.log('Full API Response:', response);
        console.log('Response data:', response.data);

        const data = response.data;

        console.time('handleResponseData');
        handleResponseData(data);
        console.timeEnd('handleResponseData');

        if (!isAuthorized) {
          console.log('Incrementing research response count for unauthorized user');
          setResearchResponseCount(prevCount => prevCount + 1);
        }

      } catch (error) {
        console.error('Error in research request:', error);
        let errorMessage = 'An error occurred while processing your request.';
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: errorMessage },
        ]);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
    console.timeEnd('handleSubmit');
  };

  const handleOnboardingAction = useCallback((action) => {
    handleSubmit({ preventDefault: () => {} }, action);
  }, [handleSubmit]);



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
      console.log('Setting optimal portfolio:', data.optimal_portfolio);
      setOptimalPortfolio(data.optimal_portfolio);
      setPortfolioSummary(data.portfolio_summary);
    } else if (data.message) {
      console.log('Adding new message to chat:', data.message);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.message }]);
    } else {
      console.error('Response does not contain expected data:', data);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Received an unexpected response from the server.' }]);
    }

    if (data.step) {
      console.log('Updating current onboarding step:', data.step);
      setCurrentOnboardingStep(data.step);
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


  const replaceUrls = useCallback((text) => {
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
  }, [urlMap]);

  const renderPortfolioSummary = useCallback((parsedXML) => {
    if (!parsedXML || !parsedXML.portfolio_summary) return null;

    const summary = parsedXML.portfolio_summary;
    const companies = Array.isArray(summary.companies.company) ? summary.companies.company : [summary.companies.company];

    return (
      <div className="portfolio-summary">
        <h2><FaChartLine /> Catholic AI Optimal Portfolio Summary</h2>
        <div className="companies">
          {companies.map((company, index) => (
            <div key={index} className="company">
              <h3>{company.name} ({company.symbol})</h3>
              <p><strong>Direction:</strong> {company.direction}</p>
              <p><strong>Allocation:</strong> {company.allocation}</p>
              <p><strong>AI Capability:</strong> {company.ai_capability}</p>
              <p><strong>Catholic Alignment:</strong> {company.catholic_alignment}</p>
              <p><strong>AI Rank:</strong> {company.ai_rank.value} out of {company.ai_rank.total}</p>
              <p><strong>Catholic Rank:</strong> {company.catholic_rank.value} out of {company.catholic_rank.total}</p>
            </div>
          ))}
        </div>
        <div className="conclusion">
          <h3>Conclusion</h3>
          <p>{summary.conclusion}</p>
        </div>
        <button 
          className="proceed-button" 
          onClick={handleProceedToSchwab}
        >
          <FaMoneyBillWave /> Proceed to Connect Schwab and Execute Orders
        </button>
      </div>
    );
  }, [handleProceedToSchwab]);

  const renderOnboardingResponse = useCallback((parsedXML) => {
    console.log("Rendering onboarding response from parsed XML");
    console.log("Current onboarding step:", currentOnboardingStep);
    console.log("Optimal portfolio:", optimalPortfolio);
    console.log("Parsed XML:", parsedXML);
    console.time('renderOnboardingResponse');
    const responses = parsedXML.root.onboarding_response;
    
    const renderResponse = (response, index) => {
      console.log(`Rendering response ${index}:`, response);
      return (
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
            <button className="begin-button" onClick={handleBeginClick}><FaChartLine /> Begin</button>
          )}
          {currentOnboardingStep === 3 && (
            <div className="sector-buttons">
              {Object.keys(sectorPeerGroupMap).map((sector) => (
                <button key={sector} className="sector-button" onClick={() => handleSectorClick(sector)}>
                  <FaChartLine /> {sector}
                </button>
              ))}
            </div>
          )}
          {currentOnboardingStep === 4 && (
            <button 
              className="proceed-button" 
              onClick={handleProceedToSchwab}
            >
              <FaMoneyBillWave /> Proceed to Connect Schwab and Execute Orders
            </button>
          )}
          {currentOnboardingStep === 5 && (
            <button 
              className="complete-button" 
              onClick={() => handleSubmit({ preventDefault: () => {} }, 'COMPLETE')}
            >
              <FaChartLine /> Complete Authentication
            </button>
          )}
        </React.Fragment>
      );
    };

    const result = (
      <div className="onboarding-response">
        {Array.isArray(responses) ? responses.map(renderResponse) : renderResponse(responses, 0)}
      </div>
    );
    console.timeEnd('renderOnboardingResponse');
    return result;
  }, [currentOnboardingStep, handleBeginClick, handleSectorClick, optimalPortfolio, handleProceedToSchwab, replaceUrls, sectorPeerGroupMap, handleSubmit]);
    

  const renderMessageContent = useCallback((content) => {
    if (React.isValidElement(content)) {
      return content;
    }
    console.log("renderMessageContent called with content:", content);
    console.time('renderMessageContent');
    
    let result;
    if (typeof content === 'string') {
      const cleanContent = content.replace(/```xml\n|\n```/g, '');
      
      if (cleanContent.includes('<onboarding_response>')) {
        try {
          const xmlDoc = new DOMParser().parseFromString(cleanContent, "text/xml");
          const onboardingResponse = xmlDoc.getElementsByTagName("onboarding_response")[0];
          
          if (onboardingResponse) {
            const question = onboardingResponse.getElementsByTagName("question")[0];
            const title = question.getElementsByTagName("title")[0]?.textContent;
            const contentItems = question.getElementsByTagName("content")[0]?.getElementsByTagName("item");
            const buttons = question.getElementsByTagName("buttons")[0]?.getElementsByTagName("button");

            result = (
              <div className="onboarding-question">
                <h3>{title}</h3>
                {contentItems && Array.from(contentItems).map((item, index) => (
                  <p key={index} dangerouslySetInnerHTML={{ __html: replaceUrls(item.textContent) }} />
                ))}
                {title === "Account Funding" && (
                  <div className="points-conversion">
                    <p>Your current points: {userPoints}</p>
                    <button onClick={handleConvertPoints} className="convert-button">
                      Convert {userPoints} points to ${userPoints / 5}
                    </button>
                    <div className="additional-capital">
                      <label htmlFor="additionalCapital">Additional Capital: $</label>
                      <input
                        type="number"
                        id="additionalCapital"
                        value={additionalCapital}
                        onChange={handleAdditionalCapitalChange}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <p>Total Investment Amount: ${totalInvestmentAmount}</p>
                  </div>
                )}
                {buttons && buttons.length > 0 && (
                  <div className="onboarding-buttons">
                    {Array.from(buttons).map((button, index) => (
                      <button
                        key={index}
                        onClick={() => handleOnboardingAction(button.getAttribute("action"))}
                        className="onboarding-button"
                      >
                        {button.getAttribute("text")}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          } else {
            result = <p dangerouslySetInnerHTML={{ __html: replaceUrls(cleanContent) }} />;
          }
        } catch (error) {
          console.error("Error parsing onboarding response:", error);
          result = <p className="error-message">Error processing onboarding response. Please try again.</p>;
        }
      } else {
        result = <p dangerouslySetInnerHTML={{ __html: replaceUrls(cleanContent) }} />;
      }
    } else if (typeof content === 'object') {
      result = <pre>{JSON.stringify(content, null, 2)}</pre>;
    } else {
      result = <p dangerouslySetInnerHTML={{ __html: replaceUrls(String(content)) }} />;
    }
    
    console.timeEnd('renderMessageContent');
    return result;
  }, [userPoints, additionalCapital, totalInvestmentAmount, handleConvertPoints, handleAdditionalCapitalChange, handleOnboardingAction, replaceUrls]);

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
                    <h2 className="system-title"><FaChartLine /> Realtime Investing Agent</h2>
                    <p className="system-description">
                      Your realtime portfolio is invested. Ask about portfolio company information related to Catholic AI Efficiency metrics, account information such as balances, positions, or performance, and execute individual trades if you'd like outside the periodic rebalancing that will be completed. Chat here anytime and receive email updates from us.      
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
                  <><FaMoneyBillWave /> Submit</>
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
          <button onClick={handleConfirmExecution}><FaChartLine /> Confirm and Execute</button>
          <button onClick={() => setShowConfirmation(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default Invest;

