import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import {useNavigate} from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    verifiedUsers: 0,
    pendingStudents: 0,
    activePosts: 0,
    activeElections: 0,
    totalVotes:0,
  });

  const[loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 

  // Sample recent activities data
  // In a real application, this would be fetched from an API
  const [recentActivities] = useState([
    { id: 1, type: 'verified', message: 'New student verification approved - John Doe', time: '2 min ago' },
    { id: 2, type: 'pending', message: 'Election post submitted for approval', time: '15 min ago' },
    { id: 3, type: 'election', message: 'New election "Student Council 2025" created', time: '1 hour ago' },
    { id: 4, type: 'vote', message: 'Voting period ended for "Class Representative"', time: '3 hours ago' }
  ]);

  // Function to fetch dashboard stats
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Assuming token is stored in localStorage
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      console.log('Dashboard Stats:', data); // Debugging line
      
      setStats({
        verifiedUsers: data.verifiedUsers || 0,
        pendingStudents: data.pendingStudents || 0,
        activePosts: data.activePosts || 0,
        activeElections: data.activeElections || 0,
        totalVotes: data.totalVotes || 0,
      });

    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load stats when component mounts
  useEffect(() => {
    fetchDashboardStats();

    // Optional: Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

 const handleAction = (actionType) => {
  console.log(`${actionType} clicked`);
  
  switch(actionType) {
    case 'view-users':
      navigate('/verified-users');
      break;
    case 'approve-students':
      navigate('/approve-students');
      break;
    case 'approve-posts':
      navigate('/approve-posts');
      break;
    case 'manage-posts':
      navigate('/manage-posts');
      break;
    case 'create-election':
      navigate('/create-election');
      break;
    case 'election-settings':
      navigate('/election-settings');
      break;
    default:
      console.warn('No handler for:', actionType);
  }
};


  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>Admin Dashboard</h1>
        </div>
        <div className="header-right">
          <div className="admin-info">
            <div className="admin-details">
              <span className="admin-name">Admin User</span>
              <span className="admin-status">Online</span>
            </div>
            <div className="admin-avatar">A</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card verified">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <div className="stat-number">{stats.verifiedUsers}</div>
            <div className="stat-label">Verified Users</div>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pendingStudents}</div>
            <div className="stat-label">Pending Students</div>
          </div>
        </div>
        
        <div className="stat-card posts">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-number">{stats.activePosts}</div>
            <div className="stat-label">Active Posts</div>
          </div>
        </div>
        
        <div className="stat-card elections">
          <div className="stat-icon">🗳️</div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeElections}</div>
            <div className="stat-label">Active Elections</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Actions Panel */}
        <div className="actions-panel">
          <h2 className="panel-title">Quick Actions</h2>
          
          <div className="action-buttons">
            <button 
              className="action-btn verified-btn"
              onClick={() => handleAction('view-users')}
            >
              <span className="btn-content">
                <span className="btn-icon">👥</span>
                <span className="btn-text">View Verified Users</span>
              </span>
              <span className="btn-badge">{stats.verifiedUsers} users</span>
            </button>

            <button 
              className="action-btn pending-btn"
              onClick={() => handleAction('approve-students')}
            >
              <span className="btn-content">
                <span className="btn-icon">⏳</span>
                <span className="btn-text">Approve Pending Students</span>
              </span>
              <span className="btn-badge notification">{stats.pendingStudents}</span>
            </button>

            <button 
              className="action-btn posts-pending-btn"
              onClick={() => handleAction('approve-posts')}
            >
              <span className="btn-content">
                <span className="btn-icon">📋</span>
                <span className="btn-text">Approve Pending Posts</span>
              </span>
              <span className="btn-badge notification">7</span>
            </button>

            <button 
              className="action-btn posts-btn"
              onClick={() => handleAction('manage-posts')}
            >
              <span className="btn-content">
                <span className="btn-icon">📝</span>
                <span className="btn-text">Manage Active Posts</span>
              </span>
              <span className="btn-badge">{stats.activePosts} active</span>
            </button>

            <button 
              className="action-btn create-btn"
              onClick={() => handleAction('create-election')}
            >
              <span className="btn-content">
                <span className="btn-icon">🗳️</span>
                <span className="btn-text">Create New Election</span>
              </span>
              <span className="btn-badge">+ New</span>
            </button>

            <button 
              className="action-btn settings-btn"
              onClick={() => handleAction('election-settings')}
            >
              <span className="btn-content">
                <span className="btn-icon">⚙️</span>
                <span className="btn-text">Election Settings</span>
              </span>
              <span className="btn-badge">Configure</span>
            </button>
          </div>
        </div>

        {/* Analytics Panel */}
        <div className="analytics-panel">
          <h2 className="panel-title">Analytics Overview</h2>
          
          {/* Chart */}
          <div className="chart-container">
            <div className="chart">
              <div className="chart-bar verified-bar" style={{height: '60%'}}>
                <span className="bar-value">{stats.verifiedUsers}</span>
              </div>
              <div className="chart-bar pending-bar" style={{height: '40%'}}>
                <span className="bar-value">{stats.pendingStudents}</span>
              </div>
              <div className="chart-bar posts-bar" style={{height: '52%'}}>
                <span className="bar-value">{stats.activePosts}</span>
              </div>
              <div className="chart-bar elections-bar" style={{height: '28%'}}>
                <span className="bar-value">{stats.activeElections}</span>
              </div>
              <div className="chart-bar votes-bar" style={{height: '76%'}}>
                <span className="bar-value">{stats.totalVotes}</span>
              </div>
            </div>
            
            <div className="chart-labels">
              <span>Verified</span>
              <span>Pending</span>
              <span>Posts</span>
              <span>Elections</span>
              <span>Total Votes</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className={`activity-item ${activity.type}`}>
                  <div className="activity-dot"></div>
                  <div className="activity-content">
                    <span className="activity-message">{activity.message}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Badge */}
      <div className="notification-alert">
        <div className="alert-icon">!</div>
        <div className="alert-content">
          <span className="alert-message">7 items need attention</span>
          <span className="alert-subtitle">Pending approvals</span>
        </div>
      </div>
    </div>
  );
};


export default AdminDashboard;