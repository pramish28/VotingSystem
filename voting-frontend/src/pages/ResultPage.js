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
import { socket } from '../socket';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const POSITIONS = ['president', 'vicePresident', 'secretary', 'treasurer', 'members'];
const POSITION_TITLES = {
  president: 'President',
  vicePresident: 'Vice President',
  secretary: 'Secretary',
  treasurer: 'Treasurer',
  members: 'Members',
};

/** TU-ish palettes per position (rotates if there are more candidates) */
const POSITION_COLORS = {
  president:     ['#1E3A8A', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'], // TU blue
  vicePresident: ['#C41E3A', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'], // TU red
  secretary:     ['#047857', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'], // emerald
  treasurer:     ['#7C3AED', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'], // violet
  members:       ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'], // amber
};

function colorsFor(pos, n) {
  const pal = POSITION_COLORS[pos] || POSITION_COLORS.president;
  const out = [];
  for (let i = 0; i < n; i++) out.push(pal[i % pal.length]);
  return out;
}

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

/** ensure candidates with 0 votes still show (from probability payload) */
function mergeResultsWithProbabilities(results, probabilities) {
  const out = Array.isArray(results) ? [...results] : [];
  const have = new Set(out.map((r) => `${r.position}|${r.candidateId}`));
  const pos = probabilities?.positions || {};
  for (const p of POSITIONS) {
    for (const c of pos[p] || []) {
      const key = `${p}|${c.candidateId}`;
      if (!have.has(key)) {
        out.push({
          candidateId: c.candidateId,
          position: p,
          name: c.name || '',
          party: c.party || '',
          votes: 0,
          percentage: 0,
        });
      }
    }
  }
  return out;
}

function ElectionBox({ box }) {
  const grouped = useMemo(() => groupByPosition(box.results), [box.results]);

  const probMap = useMemo(() => {
    const m = {};
    for (const pos of POSITIONS) {
      for (const r of box.probabilities?.positions?.[pos] || []) {
        m[`${pos}|${r.candidateId}`] = r.probability;
      }
    }
    return m;
  }, [box.probabilities]);

  return (
    <div className="election-card">
      <div className="election-header">
        <div className="election-title">{box.title || 'Election'}</div>
        <div className="election-dates">
          {box.startDate ? new Date(box.startDate).toLocaleDateString() : '—'} &nbsp;–&nbsp;
          {box.endDate ? new Date(box.endDate).toLocaleDateString() : '—'}
        </div>
      </div>

      {POSITIONS.map((pos) => {
        const rows = grouped[pos] || [];
        if (!rows.length) return null;

        const fullLabels = rows.map((r) => `${r.name}${r.party ? ` (${r.party})` : ''}`);
        // Trim very long labels to keep layout tidy; tooltip shows full text.
        const labels = fullLabels.map((t) => (t.length > 26 ? t.slice(0, 23) + '…' : t));
        const data = rows.map((r) => r.votes);
        const perc = rows.map((r) => r.percentage);

        const bg = colorsFor(pos, rows.length);

        const chartData = {
          labels,
          datasets: [
            {
              label: 'Votes',
              data,
              backgroundColor: bg,
              borderColor: bg,
              borderWidth: 1.25,
              borderRadius: 8,
              borderSkipped: false,
              barPercentage: 0.8,
              categoryPercentage: 0.7,
              maxBarThickness: 44,
              hoverBackgroundColor: bg,
            },
          ],
        };

        const options = {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 260 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(17,24,39,0.92)',
              titleColor: '#fff',
              bodyColor: '#e5e7eb',
              displayColors: false,
              padding: 10,
              callbacks: {
                title: (items) => {
                  const i = items?.[0]?.dataIndex ?? 0;
                  return fullLabels[i] ?? '';
                },
                label: (ctx) => {
                  const v = ctx.raw ?? 0;
                  const i = ctx.dataIndex;
                  const p = perc[i] ?? 0;
                  return `Votes: ${v} (${p}%)`;
                },
              },
            },
          },
          layout: { padding: { left: 4, right: 4, top: 4, bottom: 4 } },
          scales: {
            x: {
              ticks: { autoSkip: true, maxRotation: 0, minRotation: 0, color: '#6b7280' },
              grid: { display: false },
            },
            y: {
              beginAtZero: true,
              ticks: { precision: 0, color: '#6b7280' },
              grid: { color: 'rgba(17,24,39,0.06)' },
            },
          },
        };

        return (
          <div className="position-card" key={pos} data-pos={pos}>
            <div className="position-title">{POSITION_TITLES[pos]}</div>
            <div className="chart-wrap">
              <Bar data={chartData} options={options} />
            </div>

            <table className="mini-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}>#</th>
                  <th>Candidate</th>
                  <th style={{ textAlign: 'right', width: 80 }}>Votes</th>
                  <th style={{ textAlign: 'right', width: 120 }}>Share</th>
                  <th style={{ textAlign: 'right', width: 100 }}>Prob %</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => {
                  const prob = probMap[`${pos}|${r.candidateId}`];
                  return (
                    <tr key={r.candidateId}>
                      <td>{idx + 1}</td>
                      <td className="candidate-cell">
                        {r.name}{r.party ? ` (${r.party})` : ''}
                      </td>
                      <td style={{ textAlign: 'right' }}>{r.votes}</td>

                      {/* pretty percent bar + text */}
                      <td className="pct-cell">
                        <div className="pct-track">
                          <div className="pct-fill" style={{ width: `${r.percentage}%` }} />
                        </div>
                        <span className="pct-text">{r.percentage}%</span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <span className={prob != null ? 'prob-chip' : 'prob-chip muted'}>
                          {prob != null ? `${prob}%` : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
  const [electionBoxes, setElectionBoxes] = useState([]);

  const fetchOne = useCallback(async (election) => {
    const resultsData = await api
      .get(
        election?._id
          ? `/api/vote/results?electionId=${election._id}`
          : '/api/vote/results'
      )
      .then((r) => r.data || { electionId: '', results: [] });

    let probData = null;
    try {
      const p = await api.get(
        election?._id
          ? `/api/election/${election._id}/probability`
          : '/api/election/probability'
      );
      probData = p.data;
    } catch (e) {
      if (e.response?.status !== 404) throw e;
    }

    const mergedResults = mergeResultsWithProbabilities(
      resultsData.results,
      probData
    );

    return {
      electionId: resultsData.electionId || election?._id || '',
      title: election?.electionTitle || probData?.title || '',
      startDate: election?.startDate || '',
      endDate: election?.endDate || '',
      results: mergedResults,
      probabilities: probData,
    };
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      let elections = [];
      try {
        const list = await api.get('/api/election');
        elections = Array.isArray(list.data) ? list.data : [];
      } catch {
        elections = [];
      }

      if (elections.length) {
        elections.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        const boxes = await Promise.all(elections.map((el) => fetchOne(el)));
        setElectionBoxes(boxes);
      } else {
        const box = await fetchOne(null);
        setElectionBoxes([box]);
      }
    } catch (e) {
      console.error('Result load error:', e);
      setError(e.response?.data?.message || e.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [fetchOne]);

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 10000);
    return () => clearInterval(id);
  }, [loadData]);

  useEffect(() => {
    const onConnect = () => console.log('[socket] connected:', socket.id);
    const onDisconnect = () => console.log('[socket] disconnected');
    const onProbUpdate = () => {
      console.log('[socket] probability:update → reloading results');
      loadData();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('probability:update', onProbUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('probability:update', onProbUpdate);
    };
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
              key={box.electionId || `${box.title}-${box.startDate}`}
              box={box}
            />
          ))}
        </div>
      )}
    </div>
  );
}

