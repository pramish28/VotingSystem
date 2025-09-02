// import React, { useState, useEffect } from 'react';
// import './AdminDashboard.css';
// import { useNavigate } from 'react-router-dom';

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [stats, setStats] = useState({
//     verifiedUsers: 0,
//     pendingStudents: 0,
//     activePosts: 0,
//     activeElections: 0,
//     totalVotes: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [recentActivities] = useState([
//     { id: 1, type: 'verified', message: 'New student verification approved - John Doe', time: '2 min ago' },
//     { id: 2, type: 'pending', message: 'Election post submitted for approval', time: '15 min ago' },
//     { id: 3, type: 'election', message: 'New election "Student Council 2025" created', time: '1 hour ago' },
//     { id: 4, type: 'vote', message: 'Voting period ended for "Class Representative"', time: '3 hours ago' }
//   ]);

//   //logout function and state
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

// const handleLogout = () => {
//   setShowLogoutModal(true);
// };

// const confirmLogout = () => {
//   // Clear the token from localStorage
//   localStorage.removeItem('token');
//   // Navigate back to login page
//   navigate('/login'); // or whatever your login route is
// };

// const cancelLogout = () => {
//   setShowLogoutModal(false);
// };

//   const fetchDashboardStats = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetch('http://localhost:5000/api/dashboard/stats', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch dashboard stats');
//       }

//       const data = await response.json();
//       console.log('Dashboard Stats:', data);

//       setStats({
//         verifiedUsers: data.verifiedUsers || 0,
//         pendingStudents: data.pendingStudents || 0,
//         activePosts: data.activePosts || 0,
//         activeElections: data.activeElections || 0,
//         totalVotes: data.totalVotes || 0,
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
//     console.log(`${actionType} clicked`);

//     switch (actionType) {
//       case 'view-users':
//         navigate('/verified-users');
//         break;
//       case 'approve-students':
//         navigate('/approve-students');
//         break;
//       case 'approve-posts':
//         navigate('/approve-posts');
//         break;
//       case 'manage-posts':
//         navigate('/manage-posts');
//         break;
//       case 'create-election':
//         navigate('/create-election');
//         break;
//       case 'election-settings':
//         navigate('/election-settings');
//         break;
//       default:
//         console.warn('No handler for:', actionType);
//     }
//   };

//   return (
//     <div className="admin-dashboard">
//       {/* <div className="header">
//         <div className="header-left">
//           <h1>Admin Dashboard</h1>
//         </div>
//         <div className="header-right">
//           <div className="admin-info">
//             <div className="admin-details">
//               <span className="admin-name">Admin User</span>
//               <span className="admin-status">Online</span>
//             </div>
//             <div className="admin-avatar">A</div>
//           </div>
//         </div>
//       </div> */}
//       <div className="header">
//   <div className="header-left">
//     <h1>Admin Dashboard</h1>
//   </div>
//   <div className="header-right">
//     <div className="admin-info">
//       <div className="admin-details">
//         <span className="admin-name">Admin User</span>
//         <span className="admin-status">Online</span>
//       </div>
//       <div className="admin-avatar">A</div>
//     </div>
//     <button 
//       className="logout-btn" 
//       onClick={handleLogout}
//       title="Logout"
//     >
//       🚪 Logout
//     </button>
//   </div>
// </div>

//       <div className="stats-grid">
//         <div className="stat-card verified">
//           <div className="stat-icon">✓</div>
//           <div className="stat-content">
//             <div className="stat-number">{stats.verifiedUsers}</div>
//             <div className="stat-label">Verified Users</div>
//           </div>
//         </div>

//         <div className="stat-card pending">
//           <div className="stat-icon">⏳</div>
//           <div className="stat-content">
//             <div className="stat-number">{stats.pendingStudents}</div>
//             <div className="stat-label">Pending Students</div>
//           </div>
//         </div>

//         <div className="stat-card posts">
//           <div className="stat-icon">📝</div>
//           <div className="stat-content">
//             <div className="stat-number">{stats.activePosts}</div>
//             <div className="stat-label">Active Posts</div>
//           </div>
//         </div>

//         <div className="stat-card elections">
//           <div className="stat-icon">🗳️</div>
//           <div className="stat-content">
//             <div className="stat-number">{stats.activeElections}</div>
//             <div className="stat-label">Active Elections</div>
//           </div>
//         </div>
//         {showLogoutModal && (
//   <div className="modal-overlay">
//     <div className="modal-content">
//       <h3>Confirm Logout</h3>
//       <p>Are you sure you want to logout?</p>
//       <div className="modal-buttons">
//         <button 
//           className="btn-cancel" 
//           onClick={cancelLogout}
//         >
//           Cancel
//         </button>
//         <button 
//           className="btn-confirm" 
//           onClick={confirmLogout}
//         >
//           Yes, Logout
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//       </div>

//       <div className="main-content">
//         <div className="actions-panel">
//           <h2 className="panel-title">Quick Actions</h2>

//           <div className="action-buttons">
//             <button
//               className="action-btn verified-btn"
//               onClick={() => handleAction('view-users')}
//             >
//               <span className="btn-content">
//                 <span className="btn-icon">👥</span>
//                 <span className="btn-text">View Verified Users</span>
//               </span>
//               <span className="btn-badge">{stats.verifiedUsers} users</span>
//             </button>

//             <button
//               className="action-btn pending-btn"
//               onClick={() => handleAction('approve-students')}
//             >
//               <span className="btn-content">
//                 <span className="btn-icon">⏳</span>
//                 <span className="btn-text">Approve Pending Students</span>
//               </span>
//               <span className="btn-badge notification">{stats.pendingStudents}</span>
//             </button>

//             <button
//               className="action-btn posts-pending-btn"
//               onClick={() => handleAction('approve-posts')}
//             >
//               <span className="btn-content">
//                 <span className="btn-icon">📝</span>
//                 <span className="btn-text">Approve Posts</span>
//               </span>
//               <span className="btn-badge notification">{stats.activePosts}</span>
//             </button>

//             <button
//               className="action-btn election-btn"
//               onClick={() => handleAction('create-election')}
//             >
//               <span className="btn-content">
//                 <span className="btn-icon">🗳️</span>
//                 <span className="btn-text">Create Election</span>
//               </span>
//               <span className="btn-badge">{stats.activeElections}</span>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useState, useEffect, useMemo } from 'react';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';
import tuLogo from "../Image/tu-logo.png";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // === STATE (preserved) ===
  const [stats, setStats] = useState({
    verifiedUsers: 0,
    pendingStudents: 0,
    activePosts: 0,
    activeElections: 0,
    totalVotes: 0,
  });

  const [recentActivities,setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  

  // === LOGOUT (preserved) ===
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const handleLogout = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  const cancelLogout = () => setShowLogoutModal(false);

  // === FETCH (preserved) ===
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
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');

      const data = await response.json();
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

  //fetching recent activities
    const fetchRecentActivities = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/activities");
      if (!res.ok) throw new Error("Failed to fetch activities");
      const data = await res.json();
      setRecentActivities(data);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
};

 useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivities();
    const interval = setInterval(()=>{fetchDashboardStats();fetchRecentActivities();}, 30000);
    return () => clearInterval(interval);
},[]);
  // === NAV (preserved targets) ===
  const handleAction = (actionType) => {
    switch (actionType) {
      case 'view-users': navigate('/verified-users'); break;
      case 'view-dashboard': navigate('/admin-dashboard'); break;
      case 'approve-students': navigate('/approve-students'); break;
      case 'approve-posts': navigate('/approve-posts'); break;
      case 'view-posts': navigate('/view-posts'); break;
      case 'create-election': navigate('/create-election'); break;
      case 'election-settings': navigate('/settings'); break;
      case 'candidates': navigate('/candidates'); break;
      case 'create-post': navigate('/create-post'); break;

      default: console.warn('No handler for:', actionType);
    }
  };

  // === Tiny computed helpers for CSS charts ===
  const chartPercents = useMemo(() => {
    const vals = [
      stats.verifiedUsers,
      stats.pendingStudents,
      stats.activePosts,
      stats.activeElections,
      stats.totalVotes
    ];
    const max = Math.max(1, ...vals);
    const pct = (v) => Math.round((v / max) * 100);
    return {
      verified: pct(stats.verifiedUsers),
      pending: pct(stats.pendingStudents),
      posts: pct(stats.activePosts),
      elections: pct(stats.activeElections),
      votes: pct(stats.totalVotes),
    };
  }, [stats]);

  // Demo data for SVG analytics (replace with real series if you add endpoints later)
  const facultyDistribution = [
    { name: 'Science', value: Math.max(1, Math.round(stats.totalVotes * 0.32)) },
    { name: 'Management', value: Math.max(1, Math.round(stats.totalVotes * 0.28)) },
    { name: 'Humanities', value: Math.max(1, Math.round(stats.totalVotes * 0.18)) },
    { name: 'Education', value: Math.max(1, Math.round(stats.totalVotes * 0.14)) },
    { name: 'Law', value: Math.max(1, Math.round(stats.totalVotes * 0.08)) },
  ];

  const partyShares = [
    { label: 'Party A', value: 42 },
    { label: 'Party B', value: 31 },
    { label: 'Party C', value: 18 },
    { label: 'Independents', value: 9 },
  ];

  const participationTrend = [12, 18, 25, 33, 48, 60, 72, 85]; // demo line series

  // Pie math
  const pieTotal = partyShares.reduce((s, p) => s + p.value, 0);
  const pieSegments = partyShares.map((p) => ({
    ...p,
    pct: (p.value / pieTotal) * 100
  }));

  return (
    <div className="admin-dashboard tu-surface">
      {/* ===== TOP NAV BAR ===== */}
      <header className="topbar">
        <div className="topbar-left">
          <img src={tuLogo} alt="Tribhuwan University" className="tu-logo" />
          <div className="title">
            <h1>Tribhuwan University</h1>
            <span>College Election Management System</span>
          </div>
        </div>

        <div className="topbar-right">
          <button className="icon-btn" title="Notifications" aria-label="Notifications">🔔</button>
          <div className="admin-info">
            <div className="admin-meta">
              <span className="admin-name">Admin User</span>
              <span className="admin-status">Online</span>
            </div>
            <div className="admin-avatar">A</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {error && <div className="inline-error">Couldn’t refresh stats: {error}</div>}

      {/* ===== LAYOUT: SIDEBAR + CONTENT ===== */}
      <div className="layout">
        {/* === SIDEBAR (Optional enhancement) === */}
        <aside className="sidebar">
          <nav className="menu">
            <button className="menu-item active" onClick={() => handleAction('view-dashboard')}>
              <span className="mi-icon">🏠</span><span className="mi-label">Dashboard</span>
            </button>
            <button className="menu-item" onClick={() => handleAction('view-users')}>
              <span className="mi-icon">✅</span><span className="mi-label">Verified Users</span>
            </button>
            <button className="menu-item" onClick={() => handleAction('approve-students')}>
              <span className="mi-icon">⏳</span><span className="mi-label">Pending Students</span>
            </button>
            <button className="menu-item" onClick={() => handleAction('candidates')}>
              <span className="mi-icon">👤</span><span className="mi-label">Candidates</span>
            </button>
            <button className="menu-item" onClick={() => handleAction('create-election')}>
              <span className="mi-icon">🗳️</span><span className="mi-label">Election Management</span>
            </button>
            <button className="menu-item" onClick={() => handleAction('election-settings')}>
              <span className="mi-icon">📈</span><span className="mi-label">Voting Analytics</span>
            </button>
            <button className="menu-item" onClick={() => handleAction('create-post')}>
              <span className="mi-icon">➕</span><span className="mi-label">Create Post</span>
            </button>
            <button className="menu-item" onClick={() => handleAction('view-posts')}>
              <span className="mi-icon">📝</span><span className="mi-label">Posts</span>
            </button>
            <button className="menu-item" onClick={() => handleAction('election-settings')}>
              <span className="mi-icon">⚙️</span><span className="mi-label">Settings</span>
            </button>
            <button className="menu-item danger" onClick={handleLogout}>
              <span className="mi-icon">🚪</span><span className="mi-label">Logout</span>
            </button>
          </nav>
        </aside>

        {/* === MAIN CONTENT === */}
        <main className="content">
          {/* ===== STATS OVERVIEW ===== */}
          <section className={`stats-grid ${loading ? 'loading' : ''}`}>
            <div className="stat-card verified">
              <div className="stat-icon">✅</div>
              <div className="stat-meta">
                <div className="stat-number">{stats.verifiedUsers}</div>
                <div className="stat-label">Verified Users</div>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-meta">
                <div className="stat-number">{stats.pendingStudents}</div>
                <div className="stat-label">Pending Students</div>
              </div>
            </div>
            <div className="stat-card posts">
              <div className="stat-icon">📝</div>
              <div className="stat-meta">
                <div className="stat-number">{stats.activePosts}</div>
                <div className="stat-label">Active Posts</div>
              </div>
            </div>
            <div className="stat-card elections">
              <div className="stat-icon">🗳️</div>
              <div className="stat-meta">
                <div className="stat-number">{stats.activeElections}</div>
                <div className="stat-label">Active Elections</div>
              </div>
            </div>
            <div className="stat-card votes">
              <div className="stat-icon">📊</div>
              <div className="stat-meta">
                <div className="stat-number">{stats.totalVotes}</div>
                <div className="stat-label">Total Votes</div>
              </div>
            </div>
          </section>

          {/* ===== QUICK ACTIONS ===== */}
          <section className="panel actions-panel">
            <h2 className="panel-title">Quick Actions</h2>
            <div className="actions">
              <button className="action-btn" onClick={() => handleAction('view-users')}>
                <span className="ab-left"><span className="ab-icon">👥</span> View Verified Users</span>
                <span className="ab-badge">{stats.verifiedUsers}</span>
              </button>

              <button className="action-btn" onClick={() => handleAction('approve-students')}>
                <span className="ab-left"><span className="ab-icon">⏳</span> Approve Pending Students</span>
                <span className="ab-badge">{stats.pendingStudents}</span>
              </button>

              <button className="action-btn" onClick={() => handleAction('approve-posts')}>
                <span className="ab-left"><span className="ab-icon">📝</span> Approve Posts</span>
                <span className="ab-badge">{stats.activePosts}</span>
              </button>

              <button className="action-btn" onClick={() => handleAction('create-election')}>
                <span className="ab-left"><span className="ab-icon">🗳️</span> Create Election</span>
                <span className="ab-badge">{stats.activeElections}</span>
              </button>
            </div>
          </section>

          {/* ===== RECENT ACTIVITIES ===== */}
                <section className="panel recent-panel">
              <h2 className="panel-title">Recent Activities</h2>
              {recentActivities.length === 0 ? (
              <p>No recent activities yet.</p>
              ) : (
              recentActivities.slice(0, 5).map((a) => (
              <div key={a._id} className={`activity-item ${a.action}`}>
              <div className="activity-icon">
                {a.action === "update" && "✏"}
                {a.action === "delete" && "🗑"}
              </div>
              <div className="activity-text">
                <strong>{a.user}</strong> {a.message}
              </div>
              <div className="activity-time">
                {new Date(a.timestamp).toLocaleString()}
              </div>
              </div>
              ))
              )}
              </section>
         

          {/* ===== CHARTS & ANALYTICS (SVG, animated) ===== */}
          <section className="panel analytics-panel">
            <h2 className="panel-title">Election Analytics</h2>

            <div className="charts">
              {/* Faculty-wise (Bar) */}
              <div className="chart-card">
                <div className="chart-title">Faculty-wise Voting</div>
                <div className="bar-chart">
                  {facultyDistribution.map((f, idx) => {
                    const max = Math.max(...facultyDistribution.map(d => d.value), 1);
                    const h = Math.round((f.value / max) * 100);
                    return (
                      <div key={f.name} className="bar-col">
                        <div className="bar" style={{ height: `${h}%`, animationDelay: `${idx * 80}ms` }}>
                          <span className="bar-val">{f.value}</span>
                        </div>
                        <span className="bar-label">{f.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Party-wise (Pie) */}
              <div className="chart-card">
                <div className="chart-title">Party-wise Share</div>
                <div className="pie-chart" role="img" aria-label="Party-wise vote shares">
                  {(() => {
                    const size = 160;
                    const radius = 70;
                    const circ = 2 * Math.PI * radius;
                    let offset = 0;
                    return (
                      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        <g transform={`translate(${size / 2}, ${size / 2})`}>
                          {pieSegments.map((seg, i) => {
                            const dash = (seg.pct / 100) * circ;
                            const strokeDasharray = `${dash} ${circ - dash}`;
                            const circle = (
                              <circle
                                key={seg.label}
                                r={radius}
                                cx="0"
                                cy="0"
                                fill="transparent"
                                strokeWidth="24"
                                strokeLinecap="butt"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={-offset}
                                className={`pie-seg seg-${i}`}
                              />
                            );
                            offset += dash;
                            return circle;
                          })}
                        </g>
                      </svg>
                    );
                  })()}
                  <div className="pie-legend">
                    {partyShares.map((p, i) => (
                      <div key={p.label} className="legend-item">
                        <span className={`legend-dot seg-${i}`}></span>
                        <span>{p.label} — {p.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Participation (Line) */}
              <div className="chart-card">
                <div className="chart-title">Participation Trend</div>
                <svg className="line-chart" viewBox="0 0 300 140" preserveAspectRatio="none" aria-label="Voter participation trend">
                  {(() => {
                    const w = 300, h = 140, pad = 12;
                    const max = Math.max(...participationTrend, 1);
                    const stepX = (w - pad * 2) / (participationTrend.length - 1);
                    const points = participationTrend.map((v, i) => {
                      const x = pad + i * stepX;
                      const y = h - pad - (v / max) * (h - pad * 2);
                      return [x, y];
                    });
                    const path = points.map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`)).join(' ');
                    return (
                      <>
                        <path className="line-path" d={path} />
                        {points.map((p, i) => (
                          <circle key={i} className="line-dot" cx={p[0]} cy={p[1]} r="3" />
                        ))}
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ===== LOGOUT MODAL (same logic) ===== */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={cancelLogout}>Cancel</button>
              <button className="btn-confirm" onClick={confirmLogout}>Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
