import React, { useEffect, useState } from 'react';
import api from '../api';
import './ApprovePosts.css'; // Create if not exists

const ApprovePosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await api.get('/api/post/pending');
        setPosts(res.data);
      } catch (err) {
        console.error('Failed to fetch pending posts', err);
      }
    };
    fetchPending();
  }, []);

  const approvePost = async (id) => {
    try {
      await api.post(`/api/post/${id}/approve`);
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to approve post', err);
    }
  };

  const rejectPost = async (id) => {
    try {
      await api.delete(`/api/post/${id}`);
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to reject post', err);
    }
  };

  return (
    <div className="approve-posts-page">
      <h2>Pending Posts for Approval</h2>
      {posts.length === 0 ? (
        <p>No pending posts</p>
      ) : (
        posts.map(post => (
          <div key={post._id} className="post-card">
            <h3>{post.content}</h3>
            <p><strong>Posted by:</strong> {post.userId?.name}</p>
            {post.image && (
              <img src={`/uploads/${post.image}`} alt="post" style={{ width: '200px' }} />
            )}
            <div className="post-actions">
              <button onClick={() => approvePost(post._id)} className="approve-btn">Approve</button>
              <button onClick={() => rejectPost(post._id)} className="reject-btn">Reject</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ApprovePosts;
