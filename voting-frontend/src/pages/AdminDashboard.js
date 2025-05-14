import React, { useState, useEffect } from 'react';
import api from '../api';

const AdminDashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({ name: '', description: '' });
  const [electionStatus, setElectionStatus] = useState('inactive');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candidatesRes, statusRes] = await Promise.all([
          api.get('/admin/candidates'),
          api.get('/admin/election-status'),
        ]);
        setCandidates(candidatesRes.data);
        setElectionStatus(statusRes.data.status);
      } catch (err) {
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/candidates', newCandidate);
      const res = await api.get('/admin/candidates');
      setCandidates(res.data);
      setNewCandidate({ name: '', description: '' });
    } catch (err) {
      setError('Failed to add candidate');
    }
  };

  const handleDeleteCandidate = async (id) => {
    try {
      await api.delete(`/admin/candidates/${id}`);
      setCandidates(candidates.filter((c) => c._id !== id));
    } catch (err) {
      setError('Failed to delete candidate');
    }
  };

  const handleElectionToggle = async () => {
    try {
      const newStatus = electionStatus === 'active' ? 'inactive' : 'active';
      await api.post('/admin/election', { status: newStatus });
      setElectionStatus(newStatus);
    } catch (err) {
      setError('Failed to update election status');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Admin Dashboard</h2>
      <div className="mb-8">
        <h3 className="text-xl mb-2">Election Status: {electionStatus}</h3>
        <button
          onClick={handleElectionToggle}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {electionStatus === 'active' ? 'End Election' : 'Start Election'}
        </button>
      </div>
      <div>
        <h3 className="text-xl mb-2">Manage Candidates</h3>
        <form onSubmit={handleAddCandidate} className="mb-4">
          <input
            type="text"
            value={newCandidate.name}
            onChange={(e) => setNewCandidate({ ...newCandidate, name: e.target.value })}
            placeholder="Candidate Name"
            className="p-2 border mr-2"
            required
          />
          <input
            type="text"
            value={newCandidate.description}
            onChange={(e) => setNewCandidate({ ...newCandidate, description: e.target.value })}
            placeholder="Description"
            className="p-2 border mr-2"
            required
          />
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
            Add Candidate
          </button>
        </form>
        <ul>
          {candidates.map((candidate) => (
            <li key={candidate._id} className="flex justify-between items-center mb-2">
              <span>{candidate.name} - {candidate.description}</span>
              <button
                onClick={() => handleDeleteCandidate(candidate._id)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;