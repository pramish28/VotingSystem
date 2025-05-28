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
  const [success, setSuccess] = useState(''); // Added for success messages

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      setSuccess('');
      try {
        const [usersRes, candidatesRes, electionsRes, postsRes] = await Promise.all([
          api.get('/auth/users', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          api.get('/election/candidates', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          api.get('/election', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          api.get('/post', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        ]);

        console.log('Users Response:', usersRes.data);
        console.log('Candidates Response:', candidatesRes.data);
        console.log('Elections Response:', electionsRes.data);
        console.log('Posts Response:', postsRes.data);

        setPendingUsers(usersRes.data.filter(u => !u.isVerified) || []);
        setVerifiedUsers(usersRes.data.filter(u => u.isVerified) || []);
        setCandidates(candidatesRes.data || []);
        setElections(electionsRes.data || []);
        setPosts(postsRes.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        if (err.response?.status === 401) {
          setError('Unauthorized: Please log in again.');
          logout();
        } else {
          setError('Failed to load data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [logout]);

  const handleVerify = async (userId) => {
    try {
      const res = await api.post(`/auth/verify/${userId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPendingUsers(pendingUsers.filter(u => u._id !== userId));
      const user = pendingUsers.find(u => u._id === userId);
      setVerifiedUsers([...verifiedUsers, { ...user, isVerified: true }]);
      setSuccess(res.data.message);
      if (res.data.emailError) {
        setError(`Email error: ${res.data.emailError}`);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.response?.data?.error || 'Failed to verify user.');
    }
  };

  const handleApprovePost = async (postId) => {
    try {
      const res = await api.post(`/post/approve/${postId}`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setPosts(posts.map(p => p._id === postId ? { ...p, isApproved: true } : p));
      setSuccess(res.data.message || 'Post approved successfully.');
    } catch (err) {
      console.error('Approve post error:', err);
      setError(err.response?.data?.error || 'Failed to approve post.');
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/election/candidates', newCandidate, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setCandidates([...candidates, res.data]);
      setNewCandidate({ name: '', vacancy: '' });
      setSuccess('Candidate added successfully.');
    } catch (err) {
      console.error('Add candidate error:', err);
      setError('Failed to add candidate.');
    }
  };

  const handleAddElection = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/election', newElection, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setElections([...elections, res.data]);
      setNewElection({ title: '', startDate: '', endDate: '' });
      setSuccess('Election created successfully.');
    } catch (err) {
      console.error('Add election error:', err);
      setError('Failed to create election.');
    }
  };

  const handleViewDocument = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div className="admin-dashboard-container">
      <div className="sidebar">
        <h3>{user?.name || 'Admin'}</h3>
        <img src={user?.photo} alt={`${user?.name}'s avatar`} className="profile-pic" />
        <p>{user?.email}</p>
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
                <img src={user.photo} alt={`${user.name}'s portrait`} width="100" onClick={() => handleViewDocument(user.photo)} />
                <img src={user.semesterBill} alt={`${user.name}'s semester payment receipt`} width="100" onClick={() => handleViewDocument(user.semesterBill)} />
                <img src={user.identityCard} alt={`${user.name}'s identification document`} width="100" onClick={() => handleViewDocument(user.identityCard)} />
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
              <p>{post.userId?.name || 'Unknown User'}: {post.content}</p>
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