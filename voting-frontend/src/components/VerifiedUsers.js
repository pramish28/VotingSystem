// src/components/VerifiedUsers.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VerifiedUsers.css'; 

const VerifiedUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchVerifiedUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('http://localhost:5000/api/users/verified', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch verified users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedUsers();
  }, []);

  return (
    <div className="verified-users-container">
      <h2>Verified Users</h2>
      <button className="back-button" onClick={() => navigate('/admin-dashboard')}>Back to Dashboard</button>

      {loading && <p>Loading verified users...</p>}
      {error && <p className="error-message">Error: {error}</p>}

      {!loading && !error && (
        <table className='verified-users-table'>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="3" className='no-users'>No verified users found</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VerifiedUsers;
