import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    verifiedUsers: 0,
    pendingStudents: 0,
    activePosts: 0,
    activeElections: 0,
    totalVotes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recentActivities] = useState([
    { id: 1, type: 'verified', message: 'New student verification approved - John Doe', time: '2 min ago' },
    { id: 2, type: 'pending', message: 'Election post submitted for approval', time: '15 min ago' },
    { id: 3, type: 'election', message: 'New election "Student Council 2025" created', time: '1 hour ago' },
    { id: 4, type: 'vote', message: 'Voting period ended for "Class Representative"', time: '3 hours ago' }
  ]);

  //logout function and state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

const handleLogout = () => {
  setShowLogoutModal(true);
};

const confirmLogout = () => {
  // Clear the token from localStorage
  localStorage.removeItem('token');
  // Navigate back to login page
  navigate('/login'); // or whatever your login route is
};

const cancelLogout = () => {
  setShowLogoutModal(false);
};

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/dashboard/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      console.log('Dashboard Stats:', data);

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

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = (actionType) => {
    console.log(`${actionType} clicked`);

    switch (actionType) {
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
      {/* <div className="header">
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
      </div> */}
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
    <button 
      className="logout-btn" 
      onClick={handleLogout}
      title="Logout"
    >
      🚪 Logout
    </button>
  </div>
</div>

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
        {showLogoutModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Confirm Logout</h3>
      <p>Are you sure you want to logout?</p>
      <div className="modal-buttons">
        <button 
          className="btn-cancel" 
          onClick={cancelLogout}
        >
          Cancel
        </button>
        <button 
          className="btn-confirm" 
          onClick={confirmLogout}
        >
          Yes, Logout
        </button>
      </div>
    </div>
  </div>
)}

      </div>

      <div className="main-content">
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
                <span className="btn-icon">📝</span>
                <span className="btn-text">Approve Posts</span>
              </span>
              <span className="btn-badge notification">{stats.activePosts}</span>
            </button>

            <button
              className="action-btn election-btn"
              onClick={() => handleAction('create-election')}
            >
              <span className="btn-content">
                <span className="btn-icon">🗳️</span>
                <span className="btn-text">Create Election</span>
              </span>
              <span className="btn-badge">{stats.activeElections}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
