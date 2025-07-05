import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './VotingPage.css';

function VotingPage() {
  const [voterId, setVoterId] = useState('');
  const [userVoterId, setUserVoterId] = useState(''); // Logged-in user's voterId
  const [candidates, setCandidates] = useState({
    president: [],
    vicePresident: [],
    secretary: [],
    treasurer: [],
    members: [],
  });
  const [selectedCandidates, setSelectedCandidates] = useState({
    president: null,
    vicePresident: null,
    secretary: null,
    treasurer: null,
    members: [],
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch candidates and user voterId on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile to get voterId
        const userRes = await api.get('/api/user/profile');
        setUserVoterId(userRes.data.voterId || '');

        // Fetch candidates
        const candidatesRes = await api.get('/api/election/candidates');
        setCandidates(candidatesRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        setTimeout(() => navigate('/dashboard', { state: { error: 'Failed to load voting page data' } }), 2000);
      }
    };
    fetchData();
  }, [navigate]);

  const handleCandidateSelect = (position, candidate) => {
    if (position === 'members') {
      setSelectedCandidates((prev) => {
        const currentMembers = prev.members || [];
        if (currentMembers.some((c) => c._id === candidate._id)) {
          return {
            ...prev,
            members: currentMembers.filter((c) => c._id !== candidate._id),
          };
        }
        if (currentMembers.length >= 12) {
          setError('You can select up to 12 members only');
          return prev;
        }
        return { ...prev, members: [...currentMembers, candidate] };
      });
    } else {
      setSelectedCandidates((prev) => ({ ...prev, [position]: candidate }));
    }
    setError(''); // Clear error on selection
  };

  const handleVote = async () => {
    if (!voterId) {
      setError('Please enter your voter ID');
      return;
    }
    if (voterId !== userVoterId) {
      setError('Voter ID does not match your account');
      setTimeout(() => navigate('/dashboard', { state: { error: 'Invalid voter ID' } }), 2000);
      return;
    }
    if (
      !selectedCandidates.president ||
      !selectedCandidates.vicePresident ||
      !selectedCandidates.secretary ||
      !selectedCandidates.treasurer
    ) {
      setError('Please select one candidate for each position');
      return;
    }

    try {
      const votes = [
        { position: 'president', candidateId: selectedCandidates.president?._id },
        { position: 'vicePresident', candidateId: selectedCandidates.vicePresident?._id },
        { position: 'secretary', candidateId: selectedCandidates.secretary?._id },
        { position: 'treasurer', candidateId: selectedCandidates.treasurer?._id },
        ...(selectedCandidates.members || []).map((member) => ({
          position: 'members',
          candidateId: member._id,
        })),
      ];

      for (const vote of votes) {
        if (vote.candidateId) {
          await api.post('/api/vote', { voterId, candidateId: vote.candidateId, position: vote.position });
        }
      }
      setShowConfirmation(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Vote submission failed');
      setTimeout(() => navigate('/dashboard', { state: { error: 'Vote submission failed' } }), 2000);
    }
  };

  const confirmVote = async () => {
    try {
      const votes = [
        { position: 'president', candidateId: selectedCandidates.president?._id },
        { position: 'vicePresident', candidateId: selectedCandidates.vicePresident?._id },
        { position: 'secretary', candidateId: selectedCandidates.secretary?._id },
        { position: 'treasurer', candidateId: selectedCandidates.treasurer?._id },
        ...(selectedCandidates.members || []).map((member) => ({
          position: 'members',
          candidateId: member._id,
        })),
      ];

      for (const vote of votes) {
        if (vote.candidateId) {
          await api.post('/api/vote/confirm', { voterId, candidateId: vote.candidateId, position: vote.position });
        }
      }
      navigate('/results');
    } catch (err) {
      setError(err.response?.data?.message || 'Vote confirmation failed');
      setTimeout(() => navigate('/dashboard', { state: { error: 'Vote confirmation failed' } }), 2000);
    }
  };

  if (showConfirmation) {
    return (
      <div className="confirmation-container">
        <h2>Confirm Your Vote</h2>
        <p>You have selected:</p>
        {selectedCandidates.president && (
          <p>President: {selectedCandidates.president.name} ({selectedCandidates.president.party})</p>
        )}
        {selectedCandidates.vicePresident && (
          <p>Vice President: {selectedCandidates.vicePresident.name} ({selectedCandidates.vicePresident.party})</p>
        )}
        {selectedCandidates.secretary && (
          <p>Secretary: {selectedCandidates.secretary.name} ({selectedCandidates.secretary.party})</p>
        )}
        {selectedCandidates.treasurer && (
          <p>Treasurer: {selectedCandidates.treasurer.name} ({selectedCandidates.treasurer.party})</p>
        )}
        {selectedCandidates.members.length > 0 && (
          <p>Members: {selectedCandidates.members.map((m) => `${m.name} (${m.party})`).join(', ')}</p>
        )}
        <button onClick={confirmVote}>Confirm Vote</button>
        <button onClick={() => setShowConfirmation(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <div className="voting-container">
      <h2>Vote for FSU Election</h2>
      <div className="voter-id-section">
        <label>Enter Voter ID</label>
        <input
          type="text"
          placeholder="Your Voter ID"
          value={voterId}
          onChange={(e) => setVoterId(e.target.value)}
          required
        />
      </div>
      {error && <p className="error">{error}</p>}

      {['president', 'vicePresident', 'secretary', 'treasurer', 'members'].map((position) => (
        <div key={position} className="position-box">
          <h3>{position === 'members' ? 'Members (Select up to 12)' : position.charAt(0).toUpperCase() + position.slice(1)}</h3>
          {candidates[position]?.length > 0 ? (
            candidates[position].map((candidate) => (
              <div key={candidate._id} className="candidate-card">
                {candidate.photo && (
                  <img
                    src={`http://localhost:5000${candidate.photo}`}
                    alt={candidate.name}
                    className="candidate-photo"
                    onError={(e) => (e.target.src = '/placeholder.jpg')}
                  />
                )}
                <label>
                  <input
                    type={position === 'members' ? 'checkbox' : 'radio'}
                    name={position}
                    checked={
                      position === 'members'
                        ? selectedCandidates.members?.some((c) => c._id === candidate._id)
                        : selectedCandidates[position]?._id === candidate._id
                    }
                    onChange={() => handleCandidateSelect(position, candidate)}
                  />
                  {candidate.name} ({candidate.party})
                </label>
              </div>
            ))
          ) : (
            <p>No candidates available for {position}</p>
          )}
        </div>
      ))}

      <button
        onClick={handleVote}
        disabled={
          !voterId ||
          !selectedCandidates.president ||
          !selectedCandidates.vicePresident ||
          !selectedCandidates.secretary ||
          !selectedCandidates.treasurer
        }
      >
        Submit Vote
      </button>
    </div>
  );
}

export default VotingPage;