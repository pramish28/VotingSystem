import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { Link } from 'react-router-dom';
import './StudentDashboard.css';

function StudentDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/api/post');
        setPosts(res.data);
      } catch (err) {
        setError('Failed to fetch posts');
        console.error('Failed to fetch posts:', err);
      }
    };
    fetchPosts();
  }, []);

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>{user.name}</h3>
        <img src={user.photo} alt="Profile" className="profile-pic" />
        <p>{user.email}</p>
        <Link to="/vote">Vote</Link>
        <Link to="/results">Results</Link>
        <Link to="/news">Election News</Link>
        <Link to="/profile">Profile</Link>
        <button onClick={logout}>Logout</button>
      </div>
      <div className="main-content">
        <CreatePost />
        <h2>Posts</h2>
        {error && <p className="error">{error}</p>}
        {posts.length > 0 ? (
          posts.map((post) => <Post key={post._id} post={post} />)
        ) : (
          <p>No posts available</p>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;