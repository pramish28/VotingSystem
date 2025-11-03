// src/pages/PendingPostsPage.js
import React, { useEffect, useState } from 'react';
import api from '../api';
import Post from '../components/Post';
import './PendingPostsPage.css';

const PendingPostsPage = () => {
  const [pendingPosts, setPendingPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/api/post/my-posts');
        setPendingPosts(res.data.pending || []);
      } catch (err) {
        console.error('Error loading pending posts:', err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="posts-panel">
      <h2>My Pending Posts</h2>
      {pendingPosts.length === 0 ? (
        <div className="no-posts-card">
          <img
            src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' class='feather feather-clipboard'><path d='M16 2h-6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z'></path><path d='M8 2h8'></path><path d='M16 10h-8'></path></svg>"
            alt="Clipboard icon"
          />
          <span className="no-posts-title">No Pending Posts</span>
          <span className="no-posts-subtext">All posts have been processed. Check back later for new posts.</span>
        </div>
      ) : (
        pendingPosts.map((post) => (
          // Pending => NOT interactive
          <Post key={post._id} post={post} interactive={false} />
        ))
      )}
    </div>
  );
};

export default PendingPostsPage;
