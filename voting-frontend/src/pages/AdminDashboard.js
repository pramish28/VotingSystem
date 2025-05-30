import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [verifiedUsers, setVerifiedUsers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newCandidate, setNewCandidate] = useState({ name: '', vacancy: '' });
  const [newElection, setNewElection] = useState({ title: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const [usersRes, candidatesRes, electionsRes, postsRes] = await Promise.all([
          api.get('/api/auth/users'),
          api.get('/api/election/candidates'),
          api.get('/api/election'),
          api.get('/api/post'),
        ]);
        setPendingUsers(usersRes.data.filter(u => !u.isVerified) || []);
        setVerifiedUsers(usersRes.data.filter(u => u.isVerified) || []);
        setCandidates(candidatesRes.data || []);
        setElections(electionsRes.data || []);
        setPosts(postsRes.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleVerify = async (userId) => {
    try {
      const res = await api.post(`/api/auth/verify/${userId}`);
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
      const user = pendingUsers.find(u => u._id === userId);
      setVerifiedUsers([...verifiedUsers, { ...user, isVerified: true }]);
      setSuccess(res.data.message);
      if (res.data.emailError) {
        setError(`Email error: ${res.data.emailError}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify user.');
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      const res = await api.post(`/api/post/approve/${postId}`);
      setPosts(posts.map(p => p._id === postId ? { ...p, isApproved: true } : p));
      setSuccess(res.data.message || 'Post approved successfully.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve post.');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/election/candidates', newCandidate);
      setCandidates([...candidates, res.data]);
      setNewCandidate({ name: '', vacancy: '' });
      setSuccess('Candidate added successfully.');
    } catch (err) {
      setError('Failed to add candidate.');
    }
  };

  const handleAddElection = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/election', newElection);
      setElections([...elections, res.data]);
      setNewElection({ title: '', startDate: '', endDate: '' });
      setSuccess('Election created successfully.');
    } catch (err) {
      setError('Failed to create election.');
    }
  };

  const handleViewDocument = (url) => {
    window.open(url, '_blank');
  };

  if (!user || user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <div className="sidebar">
        <h3>{user.name}</h3>
        <img src={user.photo} alt="Avatar" className="profile-pic" />
        <p>{user.email}</p>
        <button onClick={logout}>Logout</button>
      </div>
      <div className="main-content">
        <h2>Admin Dashboard</h2>
        {loading && <p>Loading data...</p>}
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        
        <CreatePost />

        <h3>Pending Users</h3>
        {pendingUsers.length === 0 && !loading ? (
          <p>No pending users to verify.</p>
        ) : (
          pendingUsers.map((user) => (
            <div key={user._id} className="user-card">
              <p>{user.name} ({user.email})</p>
              <div className="document">
                <img src={user.photo} alt="Portrait" width="100" onClick={() => handleViewDocument(user.photo)} />
                <img src={user.semesterBill} alt="Semester Bill" width="100" onClick={() => handleViewDocument(user.semesterBill)} />
                <img src={user.identityCard} alt="Identity Card" width="100" onClick={() => handleViewDocument(user.identityCard)} />
              </div>
              <button onClick={() => handleVerify(user._id)} disabled={loading}>
                Verify
              </button>
            </div>
          ))
        )}

        <h3>Verified Users</h3>
        {verifiedUsers.length === 0 && !loading ? (
          <p>No verified users.</p>
        ) : (
          verifiedUsers.map((user) => (
            <p key={user._id}>{user.name} ({user.email})</p>
          ))
        )}

        <h3>Pending Post Approvals</h3>
        {posts.filter(p => !p.isApproved).length === 0 && !loading ? (
          <p>No posts pending approval.</p>
        ) : (
          posts.filter(p => !p.isApproved).map((post) => (
            <div key={post._id} className="post-card">
              <p>{post.userId?.name || 'Unknown'}: {post.content}</p>
              <button onClick={() => handleApprovePost(post._id)} disabled={loading}>
                Approve
              </button>
            </div>
          ))
        )}

        <h3>Manage Candidates</h3>
        <form onSubmit={handleAddCandidate}>
          <input
            type="text"
            placeholder="Candidate Name"
            value={newCandidate.name}
            onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Vacancy"
            value={newCandidate.vacancy}
            onChange={(e) => setNewCandidate({ ...newCandidate, vacancy: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>Add Candidate</button>
        </form>
        {candidates.length === 0 && !loading ? (
          <p>No candidates added.</p>
        ) : (
          candidates.map((c) => (
            <p key={c._id}>{c.name} ({c.vacancy})</p>
          ))
        )}

        <h3>Create Election</h3>
        <form onSubmit={handleAddElection}>
          <input
            type="text"
            placeholder="Election Title"
            value={newElection.title}
            onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
            required
          />
          <input
            type="date"
            value={newElection.startDate}
            onChange={(e) => setNewElection({ ...newElection, startDate: e.target.value })}
            required
          />
          <input
            type="date"
            value={newElection.endDate}
            onChange={(e) => setNewElection({ ...newElection, endDate: e.target.value })}
            required
          />
          <button type="submit" disabled={loading}>Create Election</button>
        </form>

        <h3>Approved Posts</h3>
        {posts.filter(p => p.isApproved).length === 0 && !loading ? (
          <p>No approved posts.</p>
        ) : (
          posts.filter(p => p.isApproved).map((post) => (
            <Post key={post._id} post={post} />
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;