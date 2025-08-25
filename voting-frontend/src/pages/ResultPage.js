import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import api from '../api';
import './ResultPage.css';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const POSITIONS = ['president', 'vicePresident', 'secretary', 'treasurer', 'members'];
const POSITION_TITLES = {
  president: 'President',
  vicePresident: 'Vice President',
  secretary: 'Secretary',
  treasurer: 'Treasurer',
  members: 'Members',
};

function groupByPosition(results) {
  const g = {};
  for (const p of POSITIONS) g[p] = [];
  for (const r of results || []) {
    if (!g[r.position]) g[r.position] = [];
    g[r.position].push(r);
  }
  for (const p of Object.keys(g)) g[p].sort((a, b) => b.votes - a.votes);
  return g;
}

function ElectionBox({ title, startDate, endDate, results }) {
  const grouped = useMemo(() => groupByPosition(results), [results]);

  return (
    <div className="election-card">
      <div className="election-header">
        <div className="election-title">{title || 'Election'}</div>
        <div className="election-dates">
          {startDate ? new Date(startDate).toLocaleDateString() : '—'} &nbsp;–&nbsp;
          {endDate ? new Date(endDate).toLocaleDateString() : '—'}
        </div>
      </div>

      {POSITIONS.map((pos) => {
        const rows = grouped[pos] || [];
        if (!rows.length) return null;

        const labels = rows.map((r) => `${r.name}${r.party ? ` (${r.party})` : ''}`);
        const data = rows.map((r) => r.votes);
        const perc = rows.map((r) => r.percentage);

        const chartData = {
          labels,
          datasets: [
            {
              label: 'Votes',
              data,
              // backgroundColor omitted -> Chart.js default color palette
              // You can add colors if you want, but keeping default keeps it simple
            },
          ],
        };

        const options = {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const v = ctx.raw ?? 0;
                  const i = ctx.dataIndex;
                  const p = perc[i] ?? 0;
                  return `Votes: ${v} (${p}%)`;
                },
              },
            },
            title: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
            },
          },
        };

        return (
          <div className="position-card" key={pos}>
            <div className="position-title">{POSITION_TITLES[pos]}</div>
            <div className="chart-wrap">
              <Bar data={chartData} options={options} />
            </div>

            {/* Optional little table under the chart */}
            <table className="mini-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}>#</th>
                  <th>Candidate</th>
                  <th style={{ textAlign: 'right', width: 80 }}>Votes</th>
                  <th style={{ textAlign: 'right', width: 70 }}>%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.candidateId}>
                    <td>{idx + 1}</td>
                    <td>{r.name}{r.party ? ` (${r.party})` : ''}</td>
                    <td style={{ textAlign: 'right' }}>{r.votes}</td>
                    <td style={{ textAlign: 'right' }}>{r.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

export default function ResultPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // If /api/election exists we’ll render one box per election; otherwise we’ll render the active/latest one.
  const [electionBoxes, setElectionBoxes] = useState([]); // [{electionId, title, startDate, endDate, results: []}]

  const fetchOneElectionResults = useCallback(async (election) => {
    const url = election?._id
      ? `/api/vote/results?electionId=${election._id}`
      : '/api/vote/results';

    const data = await api.get(url).then((r) => r.data || { electionId: '', results: [] });

    return {
      electionId: data.electionId || election?._id || '',
      title: election?.electionTitle || '',
      startDate: election?.startDate || '',
      endDate: election?.endDate || '',
      results: Array.isArray(data.results) ? data.results : [],
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Try to get all elections (this route should exist; if not, we fallback gracefully)
      let elections = [];
      try {
        const list = await api.get('/api/election');
        elections = Array.isArray(list.data) ? list.data : [];
      } catch {
        elections = [];
      }

      if (elections.length) {
        // Show ALL elections as boxes, newest first
        elections.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        const boxes = await Promise.all(elections.map((el) => fetchOneElectionResults(el)));
        setElectionBoxes(boxes);
      } else {
        // Fallback: just show the active/latest election (backend decides)
        const box = await fetchOneElectionResults(null);
        setElectionBoxes([box]);
      }
    } catch (e) {
      console.error('Result load error:', e);
      setError(e.response?.data?.message || e.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [fetchOneElectionResults]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="results-page">
      <div className="results-header">
        <h2>Election Results</h2>
        <button className="refresh-btn" onClick={loadData}>Refresh</button>
      </div>

      {loading && <p>Loading results…</p>}
      {!loading && error && <p className="error">{error}</p>}

      {!loading && !error && electionBoxes.length === 0 && (
        <div className="empty-box">No elections found.</div>
      )}

      {!loading && !error && electionBoxes.length > 0 && (
        <div className="election-grid">
          {electionBoxes.map((box) => (
            <ElectionBox
              key={box.electionId || Math.random()}
              title={box.title}
              startDate={box.startDate}
              endDate={box.endDate}
              results={box.results}
            />
          ))}
        </div>
      )}
    </div>
  );
}
