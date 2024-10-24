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
    console.time('handleSubmit');

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
        console.time('apiRequest');
                    
        const timeout = isOnboarding && currentOnboardingStep === 11 ? 300000 : 220000;

        if (isOnboarding && currentOnboardingStep === 11) {
          setLoadingMessage('Executing orders. This may take up to 5 minutes. Please do not refresh the page.');
        } else {
          setLoadingMessage('Processing your request...');
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

        console.timeEnd('apiRequest');
        console.log('Full API Response:', response);

        const data = response.data;
        console.log('Response data:', data);

        console.time('handleResponseData');
        handleResponseData(data);
        console.timeEnd('handleResponseData');

      } catch (error) {
        console.error('Error in invest chat request:', error);

        let errorMessage = 'An error occurred while processing your request.';

        if (error.response && error.response.status === 401 && error.response.data.auth_url) {
          const authUrl = error.response.data.auth_url;
          errorMessage = (
            <span>
              Authentication required. Please reauthenticate here: {' '}
              <a href={authUrl} target="_blank" rel="noopener noreferrer">
                www.schwab.com/authenticate
              </a>
            </span>
          );
        } else if (error.response && error.response.status >= 500) {
          errorMessage = 'A server error occurred. Please try again later.';
        }

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: errorMessage },
        ]);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
  };


  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);


  // After: Add useEffect for keydown event listener
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
      console.log('Handling portfolio analysis response');
      console.log('Sections:', data.data.sections);

      try {
        const parser = new DOMParser();
        const xmlContent = data.data.sections[0].content.replace(/```xml|```/g, '').trim();
        console.log('XML content to parse:', xmlContent);
        const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
        console.log('Parsed XML document:', xmlDoc);

        if (xmlDoc.querySelector("parsererror")) {
          console.error('XML parsing error:', xmlDoc.querySelector("parsererror").textContent);
          throw new Error('XML parsing failed');
        }

        const symbol = xmlDoc.querySelector('symbol')?.textContent || 'Unknown Symbol';
        console.log('Symbol:', symbol);

        const analysisMessage = (
          <div className="portfolio-analysis">
            <h2>{symbol} Portfolio Analysis</h2>
            {Array.from(xmlDoc.querySelectorAll('section')).map((section, index) => (
              <div key={index} className="analysis-section">
                <h3>{section.querySelector('title')?.textContent || `Section ${index + 1}`}</h3>
                <p>{section.querySelector('content')?.textContent?.trim() || 'No content available'}</p>
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
                        {subsection.querySelector('steps') && (
                          <div className="steps">
                            {Array.from(subsection.querySelectorAll('step')).map((step, stepIndex) => (
                              <div key={stepIndex} className="step">
                                <h5>{step.querySelector('title')?.textContent}</h5>
                                {step.querySelector('metrics') && (
                                  <ul>
                                    {Array.from(step.querySelectorAll('metric')).map((metric, metricIndex) => (
                                      <li key={metricIndex}>
                                        <span className="metric-name">{metric.querySelector('name')?.textContent}:</span>
                                        <span className="metric-value">{parseFloat(metric.querySelector('value')?.textContent).toFixed(2)}%</span>
                                        <span className="metric-weight">(weight: {parseFloat(metric.querySelector('weight')?.textContent).toFixed(2)})</span>
                                        {metric.querySelector('explanation') && (
                                          <p className="metric-explanation">{metric.querySelector('explanation')?.textContent}</p>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                                {step.querySelector('score') && (
                                  <div>
                                    <p className="calculation">Calculation: {step.querySelector('score calculation')?.textContent}</p>
                                    <p><strong>Result:</strong> {parseFloat(step.querySelector('score result')?.textContent).toFixed(2)}%</p>
                                  </div>
                                )}
                                {step.querySelector('calculation') && (
                                  <div>
                                    <p className="calculation">Calculation: {step.querySelector('calculation')?.textContent}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        {subsection.querySelector('finalScore') && (
                          <div className="final-score">
                            <h5>Final Score</h5>
                            <p className="calculation">Calculation: {subsection.querySelector('finalScore calculation')?.textContent}</p>
                            <p><strong>Value:</strong> {parseFloat(subsection.querySelector('finalScore value')?.textContent).toFixed(2)}%</p>
                          </div>
                        )}
                        {subsection.querySelector('metrics') && !subsection.querySelector('steps') && (
                          <div className="metrics">
                            <ul>
                              {Array.from(subsection.querySelectorAll('metric')).map((metric, metricIndex) => (
                                <li key={metricIndex}>
                                  <span className="metric-name">{metric.querySelector('name')?.textContent}:</span>
                                  <span className="metric-value">{parseFloat(metric.querySelector('value')?.textContent).toFixed(2)}%</span>
                                  <span className="metric-weight">(weight: {parseFloat(metric.querySelector('weight')?.textContent).toFixed(2)})</span>
                                  {metric.querySelector('explanation') && (
                                    <p className="metric-explanation">{metric.querySelector('explanation')?.textContent}</p>
                                  )}
                                </li>
                              ))}
                            </ul>
                            {subsection.querySelector('score') && (
                              <div className="score">
                                <p className="calculation">Calculation: {subsection.querySelector('score calculation')?.textContent}</p>
                                <p><strong>Value:</strong> {parseFloat(subsection.querySelector('score value')?.textContent).toFixed(2)}%</p>
                              </div>
                            )}
                          </div>
                        )}
                        {subsection.querySelector('universeStats') && (
                          <div className="universe-stats">
                            <h5>Universe Statistics</h5>
                            <p><strong>Minimum:</strong> {parseFloat(subsection.querySelector('universeStats minimum')?.textContent).toFixed(2)}%</p>
                            <p><strong>Maximum:</strong> {parseFloat(subsection.querySelector('universeStats maximum')?.textContent).toFixed(2)}%</p>
                            <p><strong>Average:</strong> {parseFloat(subsection.querySelector('universeStats average')?.textContent).toFixed(2)}%</p>
                          </div>
                        )}
                        {subsection.querySelector('peerGroupStats') && (
                          <div className="peer-group-stats">
                            <h5>Peer Group Statistics</h5>
                            <p><strong>Minimum:</strong> {parseFloat(subsection.querySelector('peerGroupStats minimum')?.textContent).toFixed(2)}%</p>
                            <p><strong>Maximum:</strong> {parseFloat(subsection.querySelector('peerGroupStats maximum')?.textContent).toFixed(2)}%</p>
                            <p><strong>Average:</strong> {parseFloat(subsection.querySelector('peerGroupStats average')?.textContent).toFixed(2)}%</p>
                          </div>
                        )}
                        {subsection.querySelector('finalRanking') && (
                          <div className="final-ranking">
                            <h5>Final Rankings</h5>
                            <p><strong>AI Rank (Universe):</strong> {subsection.querySelector('finalRanking aiRank universe')?.textContent}</p>
                            <p><strong>AI Rank (Peer Group):</strong> {subsection.querySelector('finalRanking aiRank peerGroup')?.textContent}</p>
                            <p><strong>Catholic Rank (Universe):</strong> {subsection.querySelector('finalRanking catholicRank universe')?.textContent}</p>
                            <p><strong>Catholic Rank (Peer Group):</strong> {subsection.querySelector('finalRanking catholicRank peerGroup')?.textContent}</p>
                            <p><strong>Overall Rank (Universe):</strong> {subsection.querySelector('finalRanking overallRank universe')?.textContent}</p>
                            <p><strong>Overall Rank (Peer Group):</strong> {subsection.querySelector('finalRanking overallRank peerGroup')?.textContent}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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

      // Handle the auth URL separately
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
  }, [parsedXML, messages]);


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

