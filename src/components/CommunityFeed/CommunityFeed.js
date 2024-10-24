import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import './CommunityFeed.css';

const CommunityFeed = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_ENDPOINTS.COMMUNITY}/${userId}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching community posts:', error);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_ENDPOINTS.COMMUNITY}/${userId}`, {
        content: newPost,
        post_type: 'reflection',
        privacy_level: 'public'
      });
      setNewPost('');
      fetchPosts();
    } catch (error) {
      console.error('Error submitting post:', error);
    }
  };

  return (
    <div className="community-feed">
      <h2>Community Feed</h2>
      <form onSubmit={handlePostSubmit}>
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share your thoughts or reflections..."
        />
        <button type="submit">Post</button>
      </form>
      <div className="posts-list">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <p>{post.content}</p>
            <span>{new Date(post.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunityFeed;