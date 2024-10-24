import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUsers } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';

const GroupFeed = ({ groupId }) => {
  const [feedItems, setFeedItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(API_ENDPOINTS.GET_GROUP_FEED.replace(':groupId', groupId));
        setFeedItems(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching group feed:', err);
        setError('Failed to load group feed. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeed();
    // Set up polling for real-time updates
    const intervalId = setInterval(fetchFeed, 30000); // Fetch every 30 seconds
    return () => clearInterval(intervalId); // Clean up on unmount
  }, [groupId]);

  const FeedItem = ({ item }) => (
    <div className="feed-item">
      <p>{item.content}</p>
      <div className="feed-item-meta">
        <span>Posted by: {item.user.name}</span>
        <span>{new Date(item.createdAt).toLocaleString()}</span>
      </div>
    </div>
  );

  if (isLoading) return <div>Loading group feed...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="group-feed">
      <h2><FaUsers /> Group Feed</h2>
      {feedItems.length === 0 ? (
        <p>No feed items to display.</p>
      ) : (
        feedItems.map(item => <FeedItem key={item.id} item={item} />)
      )}
    </div>
  );
};

export default GroupFeed;