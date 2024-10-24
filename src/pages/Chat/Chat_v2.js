import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { sendMessage } from '../../store/actions/chatActions';
import { logout } from '../../store/actions/userActions';
import './Chat.css';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Header from '../../components/Header/Header';
import AIMetricsChart from '../../components/AIMetricsChart/AIMetricsChart';  // Import the AIMetricsChart component

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
        const { data } = await axios.post('https://crossvalidation.ai/chat', {
          message: prompt,
          conversation_id: conversationId,
          user_id: 391,
          is_authenticated: isAuthenticated,
        }, { timeout: 180000 });

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: data.response },
        ]);

        // Set the chart data if it exists in the response
        if (data.response && typeof data.response === 'object' && data.response.chart_data) {
          setChartData(data.response);
        }
      } catch (error) {
        console.error('Error:', error);
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
    // Remove the ```html at the start and ``` at the end
    const cleanedContent = content.replace(/^```html/, '').replace(/```$/, '').trim();

    if (cleanedContent.includes('<div class="equity-report">') || cleanedContent.includes('<div class="portfolio-construction-report">')) {
      return (
        <div 
          className="report-content"
          dangerouslySetInnerHTML={{ __html: cleanedContent }} 
        />
      );
    } else {
      return cleanedContent.split('\n').map((line, lineIndex) => (
        <p key={lineIndex}>{line}</p>
      ));
    }
  };

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
                  <div className="message-content">
                    <p>
                      Analyze AI initiatives of public companies from a Godly perspective (30+ AI topics and 50 largest market cap companies; S&P500 universe available August 1st). See the company's Spiritual Equity Research Report and one year target return forecast in a single prompt. On August 1st you'll also be able to generate an optimal portfolio given any sector, market cap, and number of company allocation you desire; with weights optimized given the return forecasts of the stock universe companies. Meet your spiritual investing advisor.  
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
                {isLoading && (
                  <div className="message assistant">
                    <div className="message-content">
                      <p>Loading Your Faith Based AI Equity Research Report. Please Wait Up To 3 Minutes.</p>
                    </div>
                  </div>
                )}
                {chartData && <AIMetricsChart chartData={chartData} />}
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
