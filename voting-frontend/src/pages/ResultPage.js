import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import './ResultPage.css';

export default function ResultPage() {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]); // [{ candidateId, position, name, party, votes, percentage }]
  const [electionId, setElectionId] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const eid = params.get('electionId');
        const url = eid ? `/api/vote/results?electionId=${eid}` : '/api/vote/results';
        const res = await api.get(url);
        setElectionId(res.data?.electionId || '');
        setResults(res.data?.results || []);
      } catch (e) {
        console.error('Load results error:', e);
        setError(e.response?.data?.message || e.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  const grouped = useMemo(() => {
    const g = { president: [], vicePresident: [], secretary: [], treasurer: [], members: [] };
    for (const r of results) {
      if (g[r.position]) g[r.position].push(r);
    }
    Object.keys(g).forEach(k => g[k].sort((a,b) => b.votes - a.votes)); // winner first
    return g;
  }, [results]);

  if (loading) return <div className="result-container"><p>Loading results…</p></div>;
  if (error) return <div className="result-container"><p className="error">{error}</p></div>;

  const Section = ({ title, data }) => {
    const total = data.reduce((s, r) => s + r.votes, 0);
    const topVotes = data[0]?.votes || 0;
    return (
      <div className="result-section">
        <h3>{title}</h3>
        {data.length === 0 && <p>No votes yet.</p>}
        {data.map((r, idx) => {
          const widthPct = total ? r.votes / total * 100 : 0;
          const isWinner = idx === 0 && r.votes === topVotes;
          return (
            <div key={`${r.position}-${r.candidateId}`} className={`bar-row ${isWinner ? 'winner' : ''}`}>
              <div className="bar-label">
                <span className="candidate-name">{r.name}</span>
                {r.party ? <span className="candidate-party"> ({r.party})</span> : null}
              </div>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${widthPct}%` }} />
              </div>
              <div className="bar-stats">
                <span className="votes">{r.votes} vote{r.votes === 1 ? '' : 's'}</span>
                <span className="percent">{r.percentage.toFixed(2)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="result-container">
      <h2>Election Results</h2>
      {electionId && <p className="muted">Election ID: {electionId}</p>}

      <Section title="President" data={grouped.president} />
      <Section title="Vice President" data={grouped.vicePresident} />
      <Section title="Secretary" data={grouped.secretary} />
      <Section title="Treasurer" data={grouped.treasurer} />
      <Section title="Members" data={grouped.members} />
    </div>
  );
}
