import React, { useState, useEffect } from 'react';
import api from '../api';

const ResultPage = () => {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('/vote/results');
        setResults(response.data);
      } catch (err) {
        setError('Failed to load results');
      }
    };
    fetchResults();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Election Results</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <ul>
        {results.map((result) => (
          <li key={result._id} className="mb-2">
            {result.candidateName}: {result.voteCount} votes
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResultPage;