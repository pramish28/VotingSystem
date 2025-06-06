import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPosts: 0,
    activeElections: 0,
    totalVotes: 0,
    unreadNews: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recentActivities] = useState([
    { id: 1, type: 'post', message: 'New post created - Campus Event', time: '10 min ago' },
    { id: 2, type: 'vote', message: 'Voted in Student Council Election', time: '30 min ago' },
    { id: 3, type: 'news', message: 'New election news published', time: '1 hour ago' },
    { id: 4, type: 'result', message: 'Election results announced', time: '2 hours ago' },
  ]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/student-stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats({
        totalPosts: data.totalPosts || 0,
        activeElections: data.activeElections || 0,
        totalVotes: data.totalVotes || 0,
        unreadNews: data.unreadNews || 0,
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (actionType) => {
    console.log(`${actionType} clicked`);
    switch (actionType) {
      case 'profile':
        navigate('/profile');
        break;
      case 'result':
        navigate('/result');
        break;
      case 'election-news':
        navigate('/election-news');
        break;
      case 'vote':
        navigate('/voting');
        break;
      case 'create-post':
        navigate('/create-post');
        break;
      case 'posts':
        navigate('/posts');
        break;
      case 'logout':
        localStorage.removeItem('token');
        navigate('/login');
        break;
      case 'home':
        navigate('/');
        break;
      default:
        console.warn('No handler for:', actionType);
    }
  };

  return (
    <div className="student-dashboard">
      <div className="header">
        <div className="header-left">
          <h1>Student Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="student-info">
            <div className="student-details">
              <span className="student-name">Student User</span>
              <span className="student-status">Online</span>
            </div>
            <div className="student-avatar">S</div>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card posts">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalPosts}</div>
            <div className="stat-label">Total Posts</div>
          </div>
        </div>

        <div className="stat-card elections">
          <div className="stat-icon">🗳️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeElections}</div>
            <div className="stat-label">Active Elections</div>
          </div>
        </div>

        <div className="stat-card votes">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalVotes}</div>
            <div className="stat-label">Total Votes</div>
          </div>
        </div>

        <div className="stat-card news">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <div className="stat-number">{stats.unreadNews}</div>
            <div className="stat-label">Unread News</div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="actions-panel">
          <h2 className="panel-title">Quick Actions</h2>

          <div className="action-buttons">
            <button
              className="action-btn profile-btn"
              onClick={() => handleAction('profile')}
            >
              <span className="btn-content">
                <span className="btn-icon">👤</span>
                <span className="btn-text">View Profile</span>
              </span>
            </button>

            <button
              className="action-btn result-btn"
              onClick={() => handleAction('result')}
            >
              <span className="btn-content">
                <span className="btn-icon">📊</span>
                <span className="btn-text">View Results</span>
              </span>
            </button>

            <button
              className="action-btn news-btn"
              onClick={() => handleAction('election-news')}
            >
              <span className="btn-content">
                <span className="btn-icon">🔔</span>
                <span className="btn-text">Election News</span>
              </span>
              <span className="btn-badge notification">{stats.unreadNews}</span>
            </button>

            <button
              className="action-btn vote-btn"
              onClick={() => handleAction('vote')}
            >
              <span className="btn-content">
                <span className="btn-icon">✅</span>
                <span className="btn-text">Vote</span>
              </span>
              <span className="btn-badge">{stats.activeElections}</span>
            </button>

            <button
              className="action-btn create-post-btn"
              onClick={() => handleAction('create-post')}
            >
              <span className="btn-content">
                <span className="btn-icon">✍️</span>
                <span className="btn-text">Create Post</span>
              </span>
            </button>

            <button
              className="action-btn posts-btn"
              onClick={() => handleAction('posts')}
            >
              <span className="btn-content">
                <span className="btn-icon">📝</span>
                <span className="btn-text">View Posts</span>
              </span>
              <span className="btn-badge">{stats.totalPosts}</span>
            </button>

            <button
              className="action-btn logout-btn"
              onClick={() => handleAction('logout')}
            >
              <span className="btn-content">
                <span className="btn-icon">🚪</span>
                <span className="btn-text">Logout</span>
              </span>
            </button>

            <button
              className="action-btn home-btn"
              onClick={() => handleAction('home')}
            >
              <span className="btn-content">
                <span className="btn-icon">🏠</span>
                <span className="btn-text">Home</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;