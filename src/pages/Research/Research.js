import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { logout, fetchUserId, initializeUserId } from '../../store/actions/userActions';
import { checkAuthStatus } from '../../store/actions/authActions';
import { updateOnboardingResponse, fetchOnboardingStatus } from '../../store/actions/onboardingActions';
import './Research.css';
import { useNavigate, useLocation } from 'react-router-dom';
import PriceMetricsChart from '../../components/AIMetricsChart/PriceMetricsChart';
import ReactDOM from 'react-dom';
import { API_ENDPOINTS } from '../../config/api';
import { FaSearch, FaChartLine, FaCross, FaRobot, FaInfoCircle } from 'react-icons/fa';

const Research = () => {
  const { isAuthorized, userId, tempUserId, email } = useSelector((state) => state.user);
  const { isSchwabAuthenticated } = useSelector((state) => state.auth);
  const { step: onboardingStep, question: onboardingQuestion, completed: onboardingCompleted } = useSelector((state) => state.onboarding);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Generating your company Catholic AI Report. Please wait 1 minute.'); 
  const researchMessagesWrapperRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [conversationId, setConversationId] = useState(1);
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
  const [authData, setAuthData] = useState(null);
  const [error, setError] = useState(null);
  const [researchResponseCount, setResearchResponseCount] = useState(0);
  const effectiveUserId = userId || tempUserId;

  // ... (keep all the existing useEffect hooks and other functions)

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Handle submit triggered');

    if (prompt.trim() && effectiveUserId) {
      console.log('Prompt is valid and effective user ID exists');
      
      if (!isAuthorized && researchResponseCount >= 3) {
        console.log('Unauthorized user has reached message limit');
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'user', content: prompt },
          { role: 'assistant', content: 'Limit reached. Please register an account to continue using the research.' },
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
        console.log('Sending research request to server');
        const response = await axios.post(API_ENDPOINTS.RESEARCH, {
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

        handleResponseData(data);

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
  };

  const handleResponseData = (data) => {
    console.log('Handling response data:', data);
    if (data.status === 'success' && data.data) {
      const analysisData = data.data;
      const xmlContent = analysisData.sections[0].content.replace(/```xml|```/g, '').trim();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "text/xml");

      const formattedAnalysis = (
        <div className="portfolio-analysis">
          <h2><FaChartLine /> {xmlDoc.querySelector('symbol')?.textContent || analysisData.symbol} Portfolio Analysis</h2>
          {Array.from(xmlDoc.querySelectorAll('sections > section')).map((section, index) => (
            <div key={index} className="analysis-section">
              <h3>{section.querySelector('title')?.textContent}</h3>
              <p>{section.querySelector('content')?.textContent}</p>
              {section.querySelector('products') && (
                <div className="product-analysis">
                  <h4><FaRobot /> AI Products</h4>
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
              <h3><FaCross /> Catholic AI Rankings</h3>
              <ul>
                {Array.from(xmlDoc.querySelectorAll('rankings > *')).map((ranking, index) => (
                  <li key={index}>
                    <strong>{ranking.tagName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong>
                    <span>{ranking.textContent}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: formattedAnalysis }]);
    } else if (data.message) {
      console.log('Adding new message to research:', data.message);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.message }]);
    } else {
      console.error('Response does not contain expected data:', data);
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: 'Received an unexpected response from the server.' }]);
    }

    if (data.data?.stock_returns) setStockReturns(data.data.stock_returns);
    if (data.data?.additional_data?.ai_facts) setAiFacts(data.data.additional_data.ai_facts);
    if (data.data?.chart_data) setChartData(data.data.chart_data);
  };

  const renderMessageContent = useCallback((content) => {
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

  const samplePrompts = [
    { text: "Apple" },
    { text: "Pfizer" },
    { text: "JP Morgan" }
  ];

  const handleSamplePromptClick = (promptText) => {
    setPrompt(promptText);
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="research">
      <div className="research-content">
        <div className="research-messages-wrapper">
          <div className="research-messages" ref={researchMessagesWrapperRef}>
            <div className="message assistant">
              <div className="message-content system-message">
                <h2 className="system-title"><FaSearch /> Catholic Generative AI Efficiency Index</h2>
                <p className="system-description">
                  Provide a public comany name for analysis. Current we support the 250 largest US companies.
                </p>
              </div>
            </div>
            <div className="sample-prompts">
              {samplePrompts.map((samplePrompt, index) => (
                <div
                  key={index}
                  className="sample-prompt"
                  onClick={() => handleSamplePromptClick(samplePrompt.text)}
                  style={{ fontWeight: 'bold' }} // This makes the text bold
                >
                  {samplePrompt.text}
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
      <form onSubmit={handleSubmit} className="research-form">
        <div className="research-form-inner">
          <div className="textarea-container">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
              placeholder="Enter company name or AI metric ..."
              required
              disabled={isLoading}
            ></textarea>
            {!isAuthorized && (
              <div className="research-limit-info">
                <p><FaInfoCircle /> {Math.max(0, 3 - researchResponseCount)} free messages remaining</p>
              </div>
            )}
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <><FaSearch /> Analyze</>
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
      <div id="ai-metrics-chart"></div>
    </div>
  );
};

export default Research;
