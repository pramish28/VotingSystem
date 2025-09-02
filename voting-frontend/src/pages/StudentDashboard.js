// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './StudentDashboard.css';
// import api from '../api';
// import Post from '../components/Post';
// import {
//   FaUser, FaVoteYea, FaChartBar, FaBell, FaPenAlt,
//   FaClipboardList, FaHourglassHalf, FaCheckCircle, FaSignOutAlt
// } from 'react-icons/fa';
//  import tuLogo from "../Image/tu-logo.png";
//  import { useAuth } from "../AuthContext";


// const StudentDashboard = () => {
//   const navigate = useNavigate();

//   const { user, loading: authLoading } = useAuth(); 

//   const [stats, setStats] = useState({
//     totalPosts: 0,
//     activeElections: 0,
//     totalVotes: 0,
//     unreadNews: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [recentActivities] = useState([
//     { id: 1, type: 'post', message: 'New post created - Campus Event', time: '10 min ago' },
//     { id: 2, type: 'vote', message: 'Voted in Student Council Election', time: '30 min ago' },
//     { id: 3, type: 'news', message: 'New election news published', time: '1 hour ago' },
//     { id: 4, type: 'result', message: 'Election results announced', time: '2 hours ago' },
//   ]);

//   const fetchDashboardStats = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch('http://localhost:5000/api/dashboard/student-stats', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`,
//         },
//       });

//       if (!response.ok) throw new Error('Failed to fetch dashboard stats');

//       const data = await response.json();
//       setStats({
//         totalPosts: data.totalPosts || 0,
//         activeElections: data.activeElections || 0,
//         totalVotes: data.totalVotes || 0,
//         unreadNews: data.unreadNews || 0,
//       });
//     } catch (err) {
//       console.error('Error fetching dashboard stats:', err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardStats();
//     const interval = setInterval(fetchDashboardStats, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleAction = (actionType) => {
//     switch (actionType) {
//       case 'profile': return navigate('/profile');
//       case 'result': return navigate('/result');
//       case 'probability': return navigate('/probability');
//       case 'election-news': return navigate('/election-news');
//       case 'vote': return navigate('/vote');
//       case 'create-post': return navigate('/create-post');
//       case 'posts': return navigate('/posts');
//       case 'view-pending-posts': return navigate('/pending-posts');
//       case 'view-approved-posts': return navigate('/approved-posts');
//       case 'logout': {
//         const confirmLogout = window.confirm('Are you sure you want to logout?');
//         if (confirmLogout) {
//           localStorage.removeItem('token');
//           navigate('/login');
//         }
//         return;
//       }
//       default: console.warn('No handler for:', actionType);
//     }
//   };

//   const electionActive = stats.activeElections > 0;

//   return (
//     <div className="tu-dashboard">
//       {/* subtle centered watermark */}
//       <div className="tu-watermark" aria-hidden />

//       {/* Top brand bar */}
//       <header className="tu-topbar">
//         <div className="brand-left">
//           <div className="brand-logo">
//            <img src={tuLogo} alt="P" />
//           </div>
//           <div className="brand-text">
//             <div className="brand-title">Tribhuvan University</div>
//             <div className="brand-sub">Student Election Portal</div>
//             <div className="brand-nep">त्रिभुवन विश्वविद्यालय</div>
//           </div>
//         </div>

//         <div className="brand-right">
//           <div className="profile-chip">
//             <div className="chip-info">
//               <div className="chip-name">{displayName}</div>
//               <div className="chip-meta">Online</div>
//             </div>
//             <div className="chip-avatar">S</div>
//           </div>
//         </div>
//       </header>

//       {/* Welcome hero */}
//       <section className="tu-hero">
//         <div className="hero-left">
//           <h1 className="hero-title">Welcome to Election Dashboard</h1>
//           <p className="hero-sub">
//             Shape the future of Tribhuvan University through your participation
//           </p>
//         </div>
//         <div className="hero-right">
//           <span className={`status-pill ${electionActive ? 'active' : 'inactive'}`}>
//             {electionActive ? '• Election Active' : '• No Active Elections'}
//           </span>
//           <div className="hero-meta">
//             {electionActive ? 'Voting ends soon' : 'Stay tuned for updates'}
//           </div>
//         </div>
//       </section>

//       {/* Quick Actions */}
//       <section className="tu-section">
//         <h2 className="tu-section-title">Quick Actions</h2>
//         <div className="qa-grid">
//           <button className="qa-card qa-blue" onClick={() => handleAction('profile')}>
//             <div className="qa-icon"><FaUser /></div>
//             <div className="qa-title">View Profile</div>
//             <div className="qa-sub">Manage account</div>
//           </button>

//           <button className="qa-card qa-red" onClick={() => handleAction('vote')}>
//             <div className="qa-icon"><FaVoteYea /></div>
//             <div className="qa-title">Vote Now</div>
//             <div className="qa-sub">Cast your ballot</div>
//             {electionActive ? <span className="qa-badge">{stats.activeElections}</span> : null}
//           </button>

//           <button className="qa-card qa-green" onClick={() => handleAction('result')}>
//             <div className="qa-icon"><FaChartBar /></div>
//             <div className="qa-title">View Results</div>
//             <div className="qa-sub">Live counting</div>
//           </button>

//           <button className="qa-card qa-violet" onClick={() => handleAction('election-news')}>
//             <div className="qa-icon"><FaBell /></div>
//             <div className="qa-title">Election News</div>
//             <div className="qa-sub">Latest updates</div>
//             <span className="qa-dot">{stats.unreadNews}</span>
//           </button>

//           <button className="qa-card qa-orange" onClick={() => handleAction('create-post')}>
//             <div className="qa-icon"><FaPenAlt /></div>
//             <div className="qa-title">Create Post</div>
//             <div className="qa-sub">Share thoughts</div>
//           </button>

//           <button className="qa-card qa-teal" onClick={() => handleAction('posts')}>
//             <div className="qa-icon"><FaClipboardList /></div>
//             <div className="qa-title">View Posts</div>
//             <div className="qa-sub">Community feed</div>
//             <span className="qa-badge">{stats.totalPosts}</span>
//           </button>

//           <button className="qa-card qa-yellow" onClick={() => handleAction('view-pending-posts')}>
//             <div className="qa-icon"><FaHourglassHalf /></div>
//             <div className="qa-title">Pending Posts</div>
//             <div className="qa-sub">Under review</div>
//           </button>

//           <button className="qa-card qa-emerald" onClick={() => handleAction('view-approved-posts')}>
//             <div className="qa-icon"><FaCheckCircle /></div>
//             <div className="qa-title">Approved Posts</div>
//             <div className="qa-sub">Published</div>
//           </button>

//           <button className="qa-card qa-darkred" onClick={() => handleAction('logout')}>
//             <div className="qa-icon"><FaSignOutAlt /></div>
//             <div className="qa-title">Logout</div>
//             <div className="qa-sub">Sign out</div>
//           </button>
//         </div>
//       </section>

//       {/* KPI row styled like the screenshot */}
//       <section className="kpi-row">
//         <div className="kpi-card kpi-red">
//           <div className="kpi-left">
//             <div className="kpi-label">Active Elections</div>
//             <div className={`kpi-value ${loading ? 'skeleton' : ''}`}>{loading ? '' : stats.activeElections}</div>
//             <div className="kpi-sub">Status overview</div>
//           </div>
//           <div className="kpi-right">
//             <div className="kpi-icon">🗳️</div>
//           </div>
//         </div>

//         <div className="kpi-card kpi-blue">
//           <div className="kpi-left">
//             <div className="kpi-label">Votes Cast</div>
//             <div className={`kpi-value ${loading ? 'skeleton' : ''}`}>{loading ? '' : stats.totalVotes.toLocaleString()}</div>
//             <div className="kpi-sub">Live counting</div>
//           </div>
//           <div className="kpi-right">
//             <div className="kpi-icon">📊</div>
//           </div>
//         </div>

//         <div className="kpi-card kpi-green">
//           <div className="kpi-left">
//             <div className="kpi-label">Unread News</div>
//             <div className={`kpi-value ${loading ? 'skeleton' : ''}`}>{loading ? '' : stats.unreadNews}</div>
//             <div className="kpi-sub">Stay informed</div>
//           </div>
//           <div className="kpi-right">
//             <div className="kpi-icon">🔔</div>
//           </div>
//         </div>

//         <div className="kpi-card kpi-purple">
//           <div className="kpi-left">
//             <div className="kpi-label">Active Posts</div>
//             <div className={`kpi-value ${loading ? 'skeleton' : ''}`}>{loading ? '' : stats.totalPosts}</div>
//             <div className="kpi-sub">Community engaged</div>
//           </div>
//           <div className="kpi-right">
//             <div className="kpi-icon">📝</div>
//           </div>
//         </div>
//       </section>

//       {/* Recent Activity list */}
//       <section className="recent-card">
//         <div className="recent-title">Recent Activity</div>
//         <div className="recent-list">
//           {recentActivities.map((a) => (
//             <div key={a.id} className="recent-item">
//               <div className="recent-icon" />
//               <div className="recent-msg">{a.message}</div>
//               <div className="recent-time">{a.time}</div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {error && <div className="error-banner" role="alert">{error}</div>}
//     </div>
//   );
// };

// export default StudentDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import api from '../api';
import Post from '../components/Post';
import {
  FaUser, FaVoteYea, FaChartBar, FaBell, FaPenAlt,
  FaClipboardList, FaHourglassHalf, FaCheckCircle, FaSignOutAlt
} from 'react-icons/fa';
import tuLogo from "../Image/tu-logo.png";
import { useAuth } from "../AuthContext"; // 👈 NEW: pull current user

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // 👈 NEW

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

      if (!response.ok) throw new Error('Failed to fetch dashboard stats');

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
    switch (actionType) {
      case 'profile': return navigate('/profile');
      case 'result': return navigate('/result');
      case 'probability': return navigate('/probability');
      case 'election-news': return navigate('/election-news');
      case 'vote': return navigate('/vote');
      case 'create-post': return navigate('/create-post');
      case 'posts': return navigate('/posts');
      case 'view-pending-posts': return navigate('/pending-posts');
      case 'view-approved-posts': return navigate('/approved-posts');
      case 'logout': {
        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
          localStorage.removeItem('token');
          navigate('/login');
        }
        return;
      }
      default: console.warn('No handler for:', actionType);
    }
  };

  const electionActive = stats.activeElections > 0;

  // 👇 NEW: derive display name + avatar initial from current user
  const displayName = user?.name || (authLoading ? "Loading…" : "Student User");
  const avatarInitial = (user?.name?.trim()?.charAt(0) || "S").toUpperCase();

  return (
    <div className="tu-dashboard">
      {/* subtle centered watermark */}
      <div className="tu-watermark" aria-hidden />

      {/* Top brand bar */}
      <header className="tu-topbar">
        <div className="brand-left">
          <div className="brand-logo">
            <img src={tuLogo} alt="TU" />
          </div>
          <div className="brand-text">
            <div className="brand-title">Tribhuvan University</div>
            <div className="brand-sub">Student Election Portal</div>
            <div className="brand-nep">त्रिभुवन विश्वविद्यालय</div>
          </div>
        </div>

        <div className="brand-right">
          <div className="profile-chip">
            <div className="chip-info">
              <div className="chip-name">{displayName}</div>
              <div className="chip-meta">Online</div>
            </div>
            <div className="chip-avatar">{avatarInitial}</div>
          </div>
        </div>
      </header>

      {/* Welcome hero */}
      <section className="tu-hero">
        <div className="hero-left">
          <h1 className="hero-title">Welcome to Election Dashboard</h1>
          <p className="hero-sub">
            Shape the future of Tribhuvan University through your participation
          </p>
        </div>
        <div className="hero-right">
          <span className={`status-pill ${electionActive ? 'active' : 'inactive'}`}>
            {electionActive ? '• Election Active' : '• No Active Elections'}
          </span>
          <div className="hero-meta">
            {electionActive ? 'Voting ends soon' : 'Stay tuned for updates'}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="tu-section">
        <h2 className="tu-section-title">Quick Actions</h2>
        <div className="qa-grid">
          <button className="qa-card qa-blue" onClick={() => handleAction('profile')}>
            <div className="qa-icon"><FaUser /></div>
            <div className="qa-title">View Profile</div>
            <div className="qa-sub">Manage account</div>
          </button>

          <button className="qa-card qa-red" onClick={() => handleAction('vote')}>
            <div className="qa-icon"><FaVoteYea /></div>
            <div className="qa-title">Vote Now</div>
            <div className="qa-sub">Cast your ballot</div>
            {electionActive ? <span className="qa-badge">{stats.activeElections}</span> : null}
          </button>

          <button className="qa-card qa-green" onClick={() => handleAction('result')}>
            <div className="qa-icon"><FaChartBar /></div>
            <div className="qa-title">View Results</div>
            <div className="qa-sub">Live counting</div>
          </button>

          <button className="qa-card qa-violet" onClick={() => handleAction('election-news')}>
            <div className="qa-icon"><FaBell /></div>
            <div className="qa-title">Election News</div>
            <div className="qa-sub">Latest updates</div>
            <span className="qa-dot">{stats.unreadNews}</span>
          </button>

          <button className="qa-card qa-orange" onClick={() => handleAction('create-post')}>
            <div className="qa-icon"><FaPenAlt /></div>
            <div className="qa-title">Create Post</div>
            <div className="qa-sub">Share thoughts</div>
          </button>

          <button className="qa-card qa-teal" onClick={() => handleAction('posts')}>
            <div className="qa-icon"><FaClipboardList /></div>
            <div className="qa-title">View Posts</div>
            <div className="qa-sub">Community feed</div>
            <span className="qa-badge">{stats.totalPosts}</span>
          </button>

          <button className="qa-card qa-yellow" onClick={() => handleAction('view-pending-posts')}>
            <div className="qa-icon"><FaHourglassHalf /></div>
            <div className="qa-title">Pending Posts</div>
            <div className="qa-sub">Under review</div>
          </button>

          <button className="qa-card qa-emerald" onClick={() => handleAction('view-approved-posts')}>
            <div className="qa-icon"><FaCheckCircle /></div>
            <div className="qa-title">Approved Posts</div>
            <div className="qa-sub">Published</div>
          </button>

          <button className="qa-card qa-darkred" onClick={() => handleAction('logout')}>
            <div className="qa-icon"><FaSignOutAlt /></div>
            <div className="qa-title">Logout</div>
            <div className="qa-sub">Sign out</div>
          </button>
        </div>
      </section>

      {/* KPI row */}
      <section className="kpi-row">
        <div className="kpi-card kpi-red">
          <div className="kpi-left">
            <div className="kpi-label">Active Elections</div>
            <div className={`kpi-value ${loading ? 'skeleton' : ''}`}>{loading ? '' : stats.activeElections}</div>
            <div className="kpi-sub">Status overview</div>
          </div>
          <div className="kpi-right">
            <div className="kpi-icon">🗳️</div>
          </div>
        </div>

        <div className="kpi-card kpi-blue">
          <div className="kpi-left">
            <div className="kpi-label">Votes Cast</div>
            <div className={`kpi-value ${loading ? 'skeleton' : ''}`}>{loading ? '' : stats.totalVotes.toLocaleString()}</div>
            <div className="kpi-sub">Live counting</div>
          </div>
          <div className="kpi-right">
            <div className="kpi-icon">📊</div>
          </div>
        </div>

        <div className="kpi-card kpi-green">
          <div className="kpi-left">
            <div className="kpi-label">Unread News</div>
            <div className={`kpi-value ${loading ? 'skeleton' : ''}`}>{loading ? '' : stats.unreadNews}</div>
            <div className="kpi-sub">Stay informed</div>
          </div>
          <div className="kpi-right">
            <div className="kpi-icon">🔔</div>
          </div>
        </div>

        <div className="kpi-card kpi-purple">
          <div className="kpi-left">
            <div className="kpi-label">Active Posts</div>
            <div className={`kpi-value ${loading ? 'skeleton' : ''}`}>{loading ? '' : stats.totalPosts}</div>
            <div className="kpi-sub">Community engaged</div>
          </div>
          <div className="kpi-right">
            <div className="kpi-icon">📝</div>
          </div>
        </div>
      </section>

      {/* Recent Activity list */}
      <section className="recent-card">
        <div className="recent-title">Recent Activity</div>
        <div className="recent-list">
          {recentActivities.map((a) => (
            <div key={a.id} className="recent-item">
              <div className="recent-icon" />
              <div className="recent-msg">{a.message}</div>
              <div className="recent-time">{a.time}</div>
            </div>
          ))}
        </div>
      </section>

      {error && <div className="error-banner" role="alert">{error}</div>}
    </div>
  );
};

export default StudentDashboard;

