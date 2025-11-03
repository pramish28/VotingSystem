import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api';
import './ProbabilityPage.css';
import { socket } from '../socket'; // 👈 NEW

const POSITIONS = ['president', 'vicePresident', 'secretary', 'treasurer', 'members'];
const TITLES = {
  president: 'President',
  vicePresident: 'Vice President',
  secretary: 'Secretary',
  treasurer: 'Treasurer',
  members: 'Members',
};

function PositionCard({ title, rows }) {
  const sorted = useMemo(
    () => (rows || []).slice().sort((a, b) => b.probability - a.probability),
    [rows]
  );
  if (!sorted.length) return null;

  return (
    <div className="prob-card">
      <div className="prob-card__title">{title}</div>

      <div className="prob-card__list">
        {sorted.map((r, idx) => (
          <div key={r.candidateId} className="prob-row">
            <div className="prob-row__left">
              <div className="prob-rank">{idx + 1}</div>
              <div className="prob-name">
                {r.name}
                {r.party ? <span className="prob-party"> ({r.party})</span> : null}
              </div>
            </div>
            <div className="prob-row__right">
              <div className="prob-bar">
                <div
                  className="prob-bar__fill"
                  style={{ width: `${Math.max(0, Math.min(100, r.probability))}%` }}
                />
              </div>
              <div className="prob-pct">{r.probability.toFixed(2)}%</div>
            </div>
          </div>
        ))}
      </div>

      <table className="prob-mini-table">
        <thead>
          <tr>
            <th style={{ width: 28 }}>#</th>
            <th>Candidate</th>
            <th style={{ textAlign: 'right', width: 100 }}>Probability</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={r.candidateId + '-tbl'}>
              <td>{i + 1}</td>
              <td>{r.name}{r.party ? ` (${r.party})` : ''}</td>
              <td style={{ textAlign: 'right' }}>{r.probability.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ElectionProbBox({ box }) {
  const positions = box?.probabilities?.positions || {};
  return (
    <div className="prob-card-outer">
      <div className="prob-header">
        <div className="prob-title">{box.title || 'Election'}</div>
        <div className="prob-dates">
          {box.startDate ? new Date(box.startDate).toLocaleDateString() : '—'} &nbsp;–&nbsp;
          {box.endDate ? new Date(box.endDate).toLocaleDateString() : '—'}
        </div>
      </div>

      {POSITIONS.map((p) => (
        <PositionCard key={p} title={TITLES[p]} rows={positions[p]} />
      ))}
    </div>
  );
}

export default function ProbabilityPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [boxes, setBoxes] = useState([]);

  const fetchOne = useCallback(async (el) => {
    let prob = null;
    try {
      const p = await api.get(`/api/election/${el._id}/probability`);
      prob = p.data;
    } catch (e) {
      if (e?.response?.status !== 404) throw e;
    }
    return {
      _id: el._id,
      title: el.electionTitle,
      startDate: el.startDate,
      endDate: el.endDate,
      probabilities: prob,
    };
  }, []);

  const load = useCallback(async () => {
    try {
      setErr('');
      setLoading(true);

      let list = [];
      try {
        const r = await api.get('/api/election');
        list = Array.isArray(r.data) ? r.data : [];
      } catch {
        list = [];
      }

      if (!list.length) {
        // fallback to current/latest
        let prob = null;
        try {
          const p = await api.get('/api/election/probability');
          prob = p.data;
        } catch (e) {
          if (e?.response?.status !== 404) throw e;
        }
        setBoxes(prob ? [{
          _id: prob.electionId,
          title: prob.title,
          startDate: null,
          endDate: null,
          probabilities: prob
        }] : []);
      } else {
        list.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        const rows = await Promise.all(list.map(fetchOne));
        setBoxes(rows);
      }
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e.message || 'Failed to load probabilities');
    } finally {
      setLoading(false);
    }
  }, [fetchOne]);

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  // 👇 auto-refresh on server push
  useEffect(() => {
    const onConnect = () => console.log('[socket] connected:', socket.id);
    const onDisconnect = () => console.log('[socket] disconnected');
    const onProbUpdate = (_payload) => {
      console.log('[socket] probability:update → reloading probabilities');
      load();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('probability:update', onProbUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('probability:update', onProbUpdate);
    };
  }, [load]);

  return (
    <div className="prob-page">
      <div className="prob-header-top">
        <h2 className="prob-h2">Election Probabilities</h2>
        <button className="prob-refresh" onClick={load}>Refresh</button>
      </div>

      {loading && <div className="prob-note">Loading…</div>}
      {!loading && err && <div className="prob-error">{err}</div>}

      {!loading && !err && boxes.length === 0 && (
        <div className="prob-note">No elections found.</div>
      )}

      {!loading && !err && boxes.length > 0 && (
        <div className="prob-grid">
          {boxes.map(b => <ElectionProbBox key={b._id || Math.random()} box={b} />)}
        </div>
      )}
    </div>
  );
}
