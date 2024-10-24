import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { sendMessage } from '../../store/actions/chatActions';
import { logout } from '../../store/actions/userActions';
import './Chat.css';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';
import PriceMetricsChart from '../../components/AIMetricsChart/PriceMetricsChart';
import ReactDOM from 'react-dom';

const Chat = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isNavbarOpen, setIsNavbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatMessagesWrapperRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, userId } = useSelector((state) => state.user);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [conversationId, setConversationId] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [stockReturns, setStockReturns] = useState(null);
  const [aiFacts, setAiFacts] = useState([]);

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
      if (chatMessagesWrapperRef.current) {
        console.log('ScrollHeight:', chatMessagesWrapperRef.current.scrollHeight);
        console.log('ClientHeight:', chatMessagesWrapperRef.current.clientHeight);
      }
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
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target)
      ) {
        setIsAccountDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const getTempUserId = async () => {
      if (!isAuthenticated && !localStorage.getItem('tempUserId')) {
        try {
          const { data } = await axios.get('https://crossvalidation.ai/get_temp_user_id');
          localStorage.setItem('tempUserId', data.temp_user_id);
        } catch (error) {
          console.error('Error getting temp user id:', error);
        }
      }
    };
    getTempUserId();
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const { data } = await axios.get('https://crossvalidation.ai/get_conversation_id', {
          params: { 
            user_id: 391,
            is_authenticated: isAuthenticated,
            conversation_id: 1
          },
        });

        if (data.error) {
          alert(data.error);
          navigate('/signin');
        } else {
          const formattedMessages = data.response.map((item) => [
            { role: 'user', content: item.prompt },
            { role: 'assistant', content: item.response },
          ]).flat();
          setMessages(formattedMessages);
          setConversationId(1);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchConversation();
  }, [userId, isAuthenticated, navigate, conversationId]);

  const startNewConversation = async () => {
    try {
      const newConversationId = parseInt(conversationId) + 1;
      
      const response = await axios.get('https://crossvalidation.ai/get_conversation_id', {
        params: {
          user_id: userId,
          conversation_id: newConversationId,
          is_authenticated: isAuthenticated,
        },
      });

      if (response.data.error) {
        alert(response.data.error);
        navigate('/signin');
      } else {
        const formattedMessages = response.data.response.map((item) => [
          { role: 'user', content: item.prompt },
          { role: 'assistant', content: item.response },
        ]).flat();
        setMessages(formattedMessages);
        setConversationId(1);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prompt.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: prompt },
      ]);
      setPrompt('');
      setIsLoading(true);

      try {
        const { data } = await axios.post('http://localhost:5052/chat', {
          message: prompt,
          conversation_id: conversationId,
          user_id: 391,
          is_authenticated: isAuthenticated,
        }, { timeout: 180000 });

        console.log('Full API Response:', data);

        if (data.stock_returns) {
          console.log('Stock Returns:', data.stock_returns);
          setStockReturns(data.stock_returns);
        } else {
          console.log('No stock returns data in the response');
        }

        if (data.additional_data && data.additional_data.ai_facts) {
          console.log('AI Facts:', data.additional_data.ai_facts);
          setAiFacts(data.additional_data.ai_facts);
        } else {
          console.log('No AI facts in the response');
          setAiFacts([]);
        }

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: data.response },
        ]);

        if (data.chart_data) {
          console.log('Chart Data:', data.chart_data);
          setChartData(data.chart_data);
        } else {
          console.log('No chart data in the response');
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

  useEffect(() => {
    window.scrollTo(0, 0);
    const chatMessagesWrapper = document.querySelector('.chat-messages-wrapper');
    if (chatMessagesWrapper) {
      chatMessagesWrapper.scrollTop = 0;
    }
  }, []);

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

  useEffect(() => {
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderMessageContent = (content) => {
    const cleanedContent = content.replace(/^```html/, '').replace(/```$/, '').trim();

    if (cleanedContent.includes('<div class="ai-initiative-report">')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedContent, 'text/html');
      
      // Find the chart container
      const chartContainer = doc.querySelector('.chart-container');
      if (chartContainer) {
        // Replace the chart placeholder with a div that we can render our chart into
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
    "Tell me about Apple's major AI projects, such as their openAI integration.",
    "Is Intuit, JP Morgan, or Caterpillar a better Investment?",
    "Which Christian values does Boeing follow or not follow? Are they an ethical investment."
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
                <div className="message assistant">
                  <div className="message-content system-message">
                    <h2 className="system-title">AI Investing Research Guideline</h2>
                    <p className="system-description">
                      Provide a specific AI investment query about any of the topics and companies listed below. Your query MUST contain exactly ONE company name and ONE AI category due to current functionality limitations. Report generation takes approximately 3 minutes. 
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
                {messages.map((message, index) => {
                  console.log(`Rendering message ${index}:`, message);
                  
                  return (
                    <div key={index} className={`message ${message.role}`}>
                      <div className="message-content">
                        {renderMessageContent(message.content)}
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="message assistant">
                    <div className="message-content">
                      <p>Loading Your Faith Based AI Equity Research Report. Please Wait Up To 3 Minutes.</p>
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
            placeholder="Enter new prompt ..."
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
    </div>
  );
};

export default Chat;