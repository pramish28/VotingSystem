import React, { useState, useEffect } from 'react';
import api from '../api';

const PendingUsers = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await api.get('/admin/pending-users');
        setPendingUsers(response.data);
      } catch (err) {
        setError('Failed to load pending users');
      }
    };
    fetchPendingUsers();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.post(`/admin/verify-user/${id}`, { status });
      setPendingUsers(pendingUsers.filter((user) => user._id !== id));
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Pending Users</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul>
        {pendingUsers.map((user) => (
          <li key={user._id} className="mb-4 p-4 border rounded">
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <div className="flex mt-2">
              <a href={`/uploads/${user.photoPath.split('/').pop()}`} target="_blank" className="text-blue-500 mr-2">View Photo</a>
              <a href={`/uploads/${user.idDocumentPath.split('/').pop()}`} target="_blank" className="text-blue-500 mr-2">View ID</a>
              <a href={`/uploads/${user.admissionBillPath.split('/').pop()}`} target="_blank" className="text-blue-500">View Bill</a>
            </div>
            <div className="mt-2">
              <button
                onClick={() => handleVerify(user._id, 'approved')}
                className="bg-green-500 text-white px-4 py-2 mr-2 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleVerify(user._id, 'rejected')}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingUsers;