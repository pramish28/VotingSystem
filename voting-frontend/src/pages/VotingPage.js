import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './VotingPage.css';

function VotingPage() {
  const [voterId, setVoterId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await api.get('/election/candidates');
        setCandidates(res.data);
      } catch (err) {
        setError('Failed to fetch candidates');
      }
    };
    fetchCandidates();
  }, []);

  const handleVote = async () => {
    try {
      const res = await api.post('/vote', { voterId, candidateId: selectedCandidate._id });
      if (res.data.success) {
        setShowConfirmation(true);
      }
    } catch (err) {
      setError('Invalid voter ID or vote failed');
    }
  };

  const confirmVote = async () => {
    try {
      await api.post('/vote/confirm', { voterId, candidateId: selectedCandidate._id });
      navigate('/results');
    } catch (err) {
      setError('Vote confirmation failed');
    }
  };

  if (showConfirmation) {
    return (
      <div className="confirmation-container">
        <h2>Confirm Your Vote</h2>
        <p>You have selected {selectedCandidate.name} for {selectedCandidate.vacancy}.</p>
        <button onClick={confirmVote}>Proceed to Vote</button>
        <button onClick={() => setShowConfirmation(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="voting-container">
      <h2>Vote</h2>
      <input
        type="text"
        placeholder="Enter Voter ID"
        value={voterId}
        onChange={(e) => setVoterId(e.target.value)}
        required
      />
      <h3>Select a Candidate</h3>
      {candidates.map((candidate) => (
        <div key={candidate._id}>
          <input
            type="radio"
            name="candidate"
            onChange={() => setSelectedCandidate(candidate)}
          />
          <span>{candidate.name} ({candidate.vacancy})</span>
        </div>
      ))}
      <button onClick={handleVote} disabled={!selectedCandidate || !voterId}>
        Submit Vote
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default VotingPage;