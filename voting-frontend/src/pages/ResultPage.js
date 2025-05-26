import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../api';
import './ResultPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ResultPage() {
  const [results, setResults] = useState([]);
  const [probabilities, setProbabilities] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/vote/results');
        setResults(res.data.results);
        setProbabilities(res.data.probabilities);
      } catch (err) {
        console.error('Failed to fetch results:', err);
      }
    };
    fetchResults();
  }, []);

  const chartData = {
    labels: results.map((r) => r.candidateName),
    datasets: [
      {
        label: 'Votes',
        data: results.map((r) => r.votes),
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="results-container">
      <h2>Election Results</h2>
      <Bar
        data={chartData}
        options={{
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Votes' } },
            x: { title: { display: true, text: 'Candidates' } },
          },
          plugins: {
            title: { display: true, text: 'Election Results 2025' },
          },
        }}
      />
      <h3>Win Probability (Based on Post Interactions)</h3>
      {probabilities.map((p) => (
        <p key={p.candidateId}>
          {p.candidateName}: {(p.probability * 100).toFixed(2)}%
        </p>
      ))}
    </div>
  );
}

export default ResultPage;