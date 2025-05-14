import React, { useState, useEffect } from 'react';
import api from '../api';
import FaceCapture from '../components/FaceCapture';

const VotingPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [uniqueCode, setUniqueCode] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await api.get('/vote/candidates');
        setCandidates(response.data);
      } catch (err) {
        setError('Failed to load candidates');
      }
    };
    fetchCandidates();
  }, []);

  const handleVerify = async () => {
    if (!uniqueCode || !faceDescriptor) {
      setError('Please enter unique code and capture face');
      return;
    }
    try {
      await api.post('/vote/verify', { uniqueCode, faceDescriptor: JSON.stringify(faceDescriptor) });
      setVerified(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleVote = async (candidateId) => {
    if (!verified) {
      setError('Please verify your identity first');
      return;
    }
    try {
      await api.post('/vote', { candidateId });
      alert('Vote cast successfully');
      setVerified(false);
      setUniqueCode('');
      setFaceDescriptor(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Voting failed');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Vote</h2>
      {!verified ? (
        <div className="mb-8">
          <h3 className="text-xl mb-2">Verify Identity</h3>
          <input
            type="text"
            value={uniqueCode}
            onChange={(e) => setUniqueCode(e.target.value)}
            placeholder="Unique Code"
            className="p-2 border mb-2 w-full"
          />
          <FaceCapture onCapture={setFaceDescriptor} />
          <button
            onClick={handleVerify}
            className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
          >
            Verify
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      ) : (
        <div>
          <h3 className="text-xl mb-2">Select a Candidate</h3>
          <ul>
            {candidates.map((candidate) => (
              <li key={candidate._id} className="mb-2">
                <span>{candidate.name} - {candidate.description}</span>
                <button
                  onClick={() => handleVote(candidate._id)}
                  className="bg-green-500 text-white px-4 py-2 ml-4 rounded"
                >
                  Vote
                </button>
              </li>
            ))}
          </ul>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default VotingPage;