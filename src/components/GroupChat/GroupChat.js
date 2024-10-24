import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaComments, FaPaperPlane } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';
import { useSelector } from 'react-redux';

const GroupChat = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messageEndRef = useRef(null);
  const userId = useSelector(state => state.user.userId);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(API_ENDPOINTS.GROUP_CHAT.replace(':groupId', groupId));
        setMessages(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching chat messages:', err);
        setError('Failed to load chat messages. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    // Set up polling for real-time updates
    const intervalId = setInterval(fetchMessages, 5000); // Fetch every 5 seconds
    return () => clearInterval(intervalId); // Clean up on unmount
  }, [groupId]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const response = await axios.post(API_ENDPOINTS.GROUP_CHAT.replace(':groupId', groupId), { 
        message: newMessage,
        user_id: userId
      });
      setMessages(prevMessages => [...prevMessages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  const Message = ({ message }) => (
    <div className="message">
      <strong>{message.user}:</strong> {message.content}
      <span className="timestamp">{new Date(message.createdAt).toLocaleString()}</span>
    </div>
  );

  if (isLoading) return <div>Loading chat...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="group-chat">
      <h2><FaComments /> Group Chat</h2>
      <div className="messages-container">
        {messages.length === 0 ? (
          <p>No messages yet. Start the conversation!</p>
        ) : (
          messages.map(msg => <Message key={msg.id} message={msg} />)
        )}
        <div ref={messageEndRef} />
      </div>
      <div className="message-input">
        <input 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}><FaPaperPlane /> Send</button>
      </div>
    </div>
  );
};

export default GroupChat;