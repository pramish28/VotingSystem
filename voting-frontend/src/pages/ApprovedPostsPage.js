// src/pages/ApprovedPostsPage.js
import React, { useEffect, useState } from 'react';
import api from '../api';
import Post from '../components/Post';
import './ApprovedPostsPage.css'; 

const ApprovedPostsPage = () => {
  const [approvedPosts, setApprovedPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/api/post/my-posts');
        setApprovedPosts(res.data.approved || []);
      } catch (err) {
        console.error('Error loading approved posts:', err);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="container">
     <h2 className="page-title">My Approved Posts</h2>
      {approvedPosts.length === 0 ? (
        <p className="no-posts">No approved posts</p>
      ) : (
        approvedPosts.map((post) => <Post key={post._id} post={post} />)
      )}
    </div>
  );
};

export default ApprovedPostsPage;
