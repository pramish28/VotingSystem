// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
// import api from '../api';
// import './VotingPage.css';

// const POSITION_KEYS = ['president', 'vicePresident', 'secretary', 'treasurer', 'members'];

// export default function VotingPage() {
//   const navigate = useNavigate();
//   const params = useParams();
//   const [sp] = useSearchParams();
//   const urlElectionId = sp.get('electionId') || params.electionId || '';

//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState('');

//   const [available, setAvailable] = useState([]); // list of elections not yet voted by this user
//   const [alreadyVoted, setAlreadyVoted] = useState(false);

//   const [userVoterId, setUserVoterId] = useState('');
//   const [voterIdInput, setVoterIdInput] = useState('');

//   const [phase, setPhase] = useState('select'); // 'select' -> 'review' -> 'verify'
//   const [electionId, setElectionId] = useState('');
//   const [title, setTitle] = useState('');

//   const [candidates, setCandidates] = useState({
//     president: [],
//     vicePresident: [],
//     secretary: [],
//     treasurer: [],
//     members: [],
//   });

//   const [selected, setSelected] = useState({
//     president: null,
//     vicePresident: null,
//     secretary: null,
//     treasurer: null,
//     members: [],
//   });

//   const hasAnySelection = useMemo(() => {
//     return !!(
//       selected.president ||
//       selected.vicePresident ||
//       selected.secretary ||
//       selected.treasurer ||
//       (selected.members && selected.members.length > 0)
//     );
//   }, [selected]);

//   // Load either: available list (no electionId) OR a ballot (with electionId)
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         setLoading(true);
//         setError('');

//         // who am i (voterId)
//         const me = await api.get('/api/user/profile');
//         if (!alive) return;
//         setUserVoterId(me.data?.voterId || '');

//         if (!urlElectionId) {
//           // Show only elections user hasn't voted yet
//           const list = await api.get('/api/election/available?scope=active');
//           if (!alive) return;
//           setAvailable(list.data || []);
//           setAlreadyVoted(false);
//           setElectionId('');
//           setTitle('');
//           setCandidates({ president: [], vicePresident: [], secretary: [], treasurer: [], members: [] });
//           setPhase('select');
//         } else {
//           // Load specific election's candidates
//           const res = await api.get(`/api/election/${urlElectionId}/candidates`);
//           if (!alive) return;
//           const payload = res.data || {};
//           setElectionId(payload.electionId || '');
//           setTitle(payload.title || '');
//           setCandidates({
//             president: payload.positions?.president || [],
//             vicePresident: payload.positions?.vicePresident || [],
//             secretary: payload.positions?.secretary || [],
//             treasurer: payload.positions?.treasurer || [],
//             members: payload.positions?.members || [],
//           });
//           setAlreadyVoted(false);
//         }
//       } catch (e) {
//         const status = e.response?.status;
//         const data = e.response?.data;

//         // Already voted: hide ballot and show info
//         if (urlElectionId && status === 403 && data?.alreadyVoted) {
//           if (data.electionId) setElectionId(data.electionId);
//           if (data.title) setTitle(data.title);
//           setAlreadyVoted(true);
//           setCandidates({ president: [], vicePresident: [], secretary: [], treasurer: [], members: [] });
//           setError('You have already voted in this election. Stay updated for another election.');
//         } else {
//           console.error('VotingPage load error:', e);
//           setError(data?.message || e.message || 'Failed to load voting page data');
//         }
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, [urlElectionId]);

//   // ✅ Fixed helper: use 'cand', not 'c'
//   const pick = (position, cand) => {
//     setError('');
//     if (position === 'members') {
//       setSelected(prev => {
//         const exists = prev.members.some(m => m.candidateId === cand.candidateId);
//         if (exists) {
//           return { ...prev, members: prev.members.filter(m => m.candidateId !== cand.candidateId) };
//         }
//         if (prev.members.length >= 12) {
//           setError('You can select up to 12 members only');
//           return prev;
//         }
//         return { ...prev, members: [...prev.members, cand] };
//       });
//     } else {
//       setSelected(prev => ({ ...prev, [position]: cand }));
//     }
//   };

//   const proceedToReview = () => {
//     setError('');
//     if (!hasAnySelection) return setError('Please select at least one candidate.');
//     setPhase('review');
//   };

//   const proceedToVerify = () => {
//     setError('');
//     setPhase('verify');
//   };

//   const backToSelect = () => {
//     setError('');
//     setPhase('select');
//   };

//   const castAndConfirm = async () => {
//     try {
//       setError('');
//       if (!voterIdInput) return setError('Please enter your Voter ID');
//       if (voterIdInput !== userVoterId) return setError('Voter ID does not match your account');

//       const votes = [];
//       if (selected.president)     votes.push({ position: 'president',     candidateId: selected.president.candidateId });
//       if (selected.vicePresident) votes.push({ position: 'vicePresident', candidateId: selected.vicePresident.candidateId });
//       if (selected.secretary)     votes.push({ position: 'secretary',     candidateId: selected.secretary.candidateId });
//       if (selected.treasurer)     votes.push({ position: 'treasurer',     candidateId: selected.treasurer.candidateId });
//       for (const m of (selected.members || [])) votes.push({ position: 'members', candidateId: m.candidateId });
//       if (votes.length === 0) return setError('No candidates selected to vote for.');

//       setSubmitting(true);

//       // Submit pending (ignore individual failures)
//       const payloads = votes.map(v => ({ electionId, voterId: voterIdInput, position: v.position, candidateId: v.candidateId }));
//       await Promise.allSettled(payloads.map(b => api.post('/api/vote', b)));

//       // Confirm all
//       await api.post('/api/vote/confirm-all', { electionId, voterId: voterIdInput });

//       // Let Result page know which election to show
//       sessionStorage.setItem('lastElectionVoted', electionId);
//       navigate('/result');
//     } catch (e) {
//       console.error('Voting failed:', e);
//       setError(e.response?.data?.message || 'Voting failed');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ---------- RENDER ----------
//   if (loading) {
//     return <div className="voting-container"><p>Loading…</p></div>;
//   }

//   // No electionId in URL => show available elections (not voted)
//   if (!urlElectionId) {
//     return (
//       <div className="voting-container">
//         <h2>Available Elections</h2>
//         {error && <p className="error">{error}</p>}

//         {!available.length ? (
//           <p>No eligible elections right now. You may have already voted in the active ones.</p>
//         ) : (
//           <div className="election-list">
//             {available.map(e => (
//               <div key={e._id} className="election-card">
//                 <div className="election-title">{e.electionTitle}</div>
//                 <div className="election-dates">
//                   {new Date(e.startDate).toLocaleDateString()} – {new Date(e.endDate).toLocaleDateString()}
//                 </div>
//                 <button onClick={() => navigate(`/vote?electionId=${e._id}`)}>
//                   Vote
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     );
//   }

//   // electionId present => ballot or "already voted" info
//   return (
//     <div className="voting-container">
//       <h2>{title ? `Vote: ${title}` : 'Vote'}</h2>

//       {alreadyVoted ? (
//         <div className="info-box">
//           <p>You have already voted in this election. Stay updated for another election.</p>
//           <div className="verify-actions" style={{ marginTop: 12 }}>
//             <button onClick={() => navigate('/vote')}>Back to elections</button>
//             <button
//               onClick={() => { sessionStorage.setItem('lastElectionVoted', electionId); navigate('/result'); }}
//               style={{ marginLeft: 8 }}
//             >
//               View results
//             </button>
//           </div>
//         </div>
//       ) : (
//         <>
//           {error && <p className="error">{error}</p>}

//           {phase === 'select' && (
//             <>
//               {POSITION_KEYS.map(position => (
//                 <div key={position} className="position-box">
//                   <h3>{position === 'members' ? 'Members (Select up to 12)' : position.charAt(0).toUpperCase() + position.slice(1)}</h3>
//                   {candidates[position]?.length ? (
//                     candidates[position].map(c => (
//                       <div key={c.candidateId} className="candidate-card">
//                         {c.photo && (
//                           <img
//                             src={c.photo}
//                             alt={c.name}
//                             className="candidate-photo"
//                             onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
//                           />
//                         )}
//                         <label>
//                           <input
//                             type={position === 'members' ? 'checkbox' : 'radio'}
//                             name={position}
//                             checked={
//                               position === 'members'
//                                 ? selected.members.some(m => m.candidateId === c.candidateId)
//                                 : selected[position]?.candidateId === c.candidateId
//                             }
//                             onChange={() => pick(position, c)} 
//                           />
//                           {c.name} {c.party ? `(${c.party})` : ''}
//                         </label>
//                       </div>
//                     ))
//                   ) : (
//                     <p>No candidates available for {position}</p>
//                   )}
//                 </div>
//               ))}
//               <button onClick={proceedToReview} disabled={!hasAnySelection}>Proceed</button>
//             </>
//           )}

//           {phase === 'review' && (
//             <div className="review-box">
//               <h3>Review your selections</h3>
//               <ul className="review-list">
//                 {selected.president     && <li>President: {selected.president.name} {selected.president.party ? `(${selected.president.party})` : ''}</li>}
//                 {selected.vicePresident && <li>Vice President: {selected.vicePresident.name} {selected.vicePresident.party ? `(${selected.vicePresident.party})` : ''}</li>}
//                 {selected.secretary     && <li>Secretary: {selected.secretary.name} {selected.secretary.party ? `(${selected.secretary.party})` : ''}</li>}
//                 {selected.treasurer     && <li>Treasurer: {selected.treasurer.name} {selected.treasurer.party ? `(${selected.treasurer.party})` : ''}</li>}
//                 {selected.members.length > 0 && (
//                   <li>Members: {selected.members.map(m => `${m.name}${m.party ? ` (${m.party})` : ''}`).join(', ')}</li>
//                 )}
//               </ul>
//               <p className="confirm-text">You are going to vote for the candidate(s) listed above.</p>
//               <div className="review-actions">
//                 <button onClick={backToSelect}>Edit selection</button>
//                 <button onClick={proceedToVerify}>Continue</button>
//               </div>
//             </div>
//           )}

//           {phase === 'verify' && (
//             <div className="verify-box">
//               <h3>Verify your identity</h3>
//               <p>Enter your Voter ID (must match your account):</p>
//               <input
//                 type="text"
//                 placeholder="Your Voter ID"
//                 value={voterIdInput}
//                 onChange={(e) => setVoterIdInput(e.target.value)}
//               />
//               <div className="verify-actions">
//                 <button onClick={() => setPhase('review')}>Back</button>
//                 <button onClick={castAndConfirm} disabled={submitting}>
//                   {submitting ? 'Submitting…' : 'Cast vote'}
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// src/pages/VotingPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../api';
import './VotingPage.css';

const POSITION_KEYS = ['president', 'vicePresident', 'secretary', 'treasurer', 'members'];

export default function VotingPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [sp] = useSearchParams();
  const urlElectionId = sp.get('electionId') || params.electionId || '';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // List of elections the current user has NOT confirmed votes in
  const [available, setAvailable] = useState([]);

  // Ballot state
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [userVoterId, setUserVoterId] = useState('');
  const [voterIdInput, setVoterIdInput] = useState('');

  const [phase, setPhase] = useState('select'); // 'select' → 'review' → 'verify'
  const [electionId, setElectionId] = useState('');
  const [title, setTitle] = useState('');

  const [candidates, setCandidates] = useState({
    president: [],
    vicePresident: [],
    secretary: [],
    treasurer: [],
    members: [],
  });

  const [selected, setSelected] = useState({
    president: null,
    vicePresident: null,
    secretary: null,
    treasurer: null,
    members: [],
  });

  const hasAnySelection = useMemo(() => {
    return !!(
      selected.president ||
      selected.vicePresident ||
      selected.secretary ||
      selected.treasurer ||
      (selected.members && selected.members.length > 0)
    );
  }, [selected]);

  // Load profile + either election list or specific ballot
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');

        // Who am I? (to get voterId)
        const me = await api.get('/api/user/profile');
        if (!alive) return;
        setUserVoterId(me.data?.voterId || '');

        if (!urlElectionId) {
          // 👉 Always fetch ALL elections the user hasn't voted in
          const all = await api.get('/api/election/available?scope=all');
          if (!alive) return;
          setAvailable(all.data || []);
          setAlreadyVoted(false);
          setElectionId('');
          setTitle('');
          setCandidates({ president: [], vicePresident: [], secretary: [], treasurer: [], members: [] });
          setPhase('select');
        } else {
          // Load specific election's candidates
          const res = await api.get(`/api/election/${urlElectionId}/candidates`);
          if (!alive) return;
          const payload = res.data || {};
          setElectionId(payload.electionId || '');
          setTitle(payload.title || '');
          setCandidates({
            president: payload.positions?.president || [],
            vicePresident: payload.positions?.vicePresident || [],
            secretary: payload.positions?.secretary || [],
            treasurer: payload.positions?.treasurer || [],
            members: payload.positions?.members || [],
          });
          setAlreadyVoted(false);
        }
      } catch (e) {
        const status = e.response?.status;
        const data = e.response?.data;

        // If the user already voted in this election, show info and hide ballot
        if (urlElectionId && status === 403 && data?.alreadyVoted) {
          if (data.electionId) setElectionId(data.electionId);
          if (data.title) setTitle(data.title);
          setAlreadyVoted(true);
          setCandidates({ president: [], vicePresident: [], secretary: [], treasurer: [], members: [] });
          setError('You have already voted in this election. Stay updated for another election.');
        } else {
          console.error('VotingPage load error:', e);
          setError(data?.message || e.message || 'Failed to load voting page data');
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [urlElectionId]);

  // Select helpers
  const pick = (position, cand) => {
    setError('');
    if (position === 'members') {
      setSelected(prev => {
        const exists = prev.members.some(m => m.candidateId === cand.candidateId);
        if (exists) {
          return { ...prev, members: prev.members.filter(m => m.candidateId !== cand.candidateId) };
        }
        if (prev.members.length >= 12) {
          setError('You can select up to 12 members only');
          return prev;
        }
        return { ...prev, members: [...prev.members, cand] };
      });
    } else {
      setSelected(prev => ({ ...prev, [position]: cand }));
    }
  };

  const proceedToReview = () => {
    setError('');
    if (!hasAnySelection) return setError('Please select at least one candidate.');
    setPhase('review');
  };

  const proceedToVerify = () => setPhase('verify');
  const backToSelect = () => setPhase('select');

  // Submit pending votes → confirm-all → redirect /result
  const castAndConfirm = async () => {
    try {
      setError('');
      if (!voterIdInput) return setError('Please enter your Voter ID');
      if (voterIdInput !== userVoterId) return setError('Voter ID does not match your account');

      const votes = [];
      if (selected.president)     votes.push({ position: 'president',     candidateId: selected.president.candidateId });
      if (selected.vicePresident) votes.push({ position: 'vicePresident', candidateId: selected.vicePresident.candidateId });
      if (selected.secretary)     votes.push({ position: 'secretary',     candidateId: selected.secretary.candidateId });
      if (selected.treasurer)     votes.push({ position: 'treasurer',     candidateId: selected.treasurer.candidateId });
      for (const m of (selected.members || [])) votes.push({ position: 'members', candidateId: m.candidateId });
      if (votes.length === 0) return setError('No candidates selected to vote for.');

      setSubmitting(true);

      // Submit pending (idempotent per position/candidate)
      const payloads = votes.map(v => ({ electionId, voterId: voterIdInput, position: v.position, candidateId: v.candidateId }));
      await Promise.allSettled(payloads.map(b => api.post('/api/vote', b)));

      // Confirm all for this election/voter
      await api.post('/api/vote/confirm-all', { electionId, voterId: voterIdInput });

      // Remember which election to show on /result
      sessionStorage.setItem('lastElectionVoted', electionId);
      navigate('/result');
    } catch (e) {
      console.error('Voting failed:', e);
      setError(e.response?.data?.message || 'Voting failed');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- UI ----------
  if (loading) return <div className="voting-container"><p>Loading…</p></div>;

  // No election selected → list all elections you haven't voted in
  if (!urlElectionId) {
    return (
      <div className="voting-container">
        <h2>Available Elections</h2>
        {error && <p className="error">{error}</p>}
        {!available.length ? (
          <p>No eligible elections right now. You may have already voted in all of them.</p>
        ) : (
          <div className="election-list">
            {available.map(el => (
              <div key={el._id} className="election-card">
                <div className="election-title">{el.electionTitle}</div>
                <div className="election-dates">
                  {new Date(el.startDate).toLocaleDateString()} – {new Date(el.endDate).toLocaleDateString()}
                </div>
                <button onClick={() => navigate(`/vote?electionId=${el._id}`)}>Vote</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Election selected → ballot (or "already voted" info)
  return (
    <div className="voting-container">
      <h2>{title ? `Vote: ${title}` : 'Vote'}</h2>

      {alreadyVoted ? (
        <div className="info-box">
          <p>You have already voted in this election. Stay updated for another election.</p>
          <div className="verify-actions" style={{ marginTop: 12 }}>
            <button onClick={() => navigate('/vote')}>Back to elections</button>
            <button
              onClick={() => { sessionStorage.setItem('lastElectionVoted', electionId); navigate('/result'); }}
              style={{ marginLeft: 8 }}
            >
              View results
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && <p className="error">{error}</p>}

          {phase === 'select' && (
            <>
              {POSITION_KEYS.map(position => (
                <div key={position} className="position-box">
                  <h3>{position === 'members' ? 'Members (Select up to 12)' : position.charAt(0).toUpperCase() + position.slice(1)}</h3>
                  {candidates[position]?.length ? (
                    candidates[position].map(cand => (
                      <div key={cand.candidateId} className="candidate-card">
                        {cand.photo && (
                          <img
                            src={cand.photo}
                            alt={cand.name}
                            className="candidate-photo"
                            onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
                          />
                        )}
                        <label>
                          <input
                            type={position === 'members' ? 'checkbox' : 'radio'}
                            name={position}
                            checked={
                              position === 'members'
                                ? selected.members.some(m => m.candidateId === cand.candidateId)
                                : selected[position]?.candidateId === cand.candidateId
                            }
                            onChange={() => pick(position, cand)}
                          />
                          {cand.name} {cand.party ? `(${cand.party})` : ''}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p>No candidates available for {position}</p>
                  )}
                </div>
              ))}
              <button onClick={proceedToReview} disabled={!hasAnySelection}>Proceed</button>
            </>
          )}

          {phase === 'review' && (
            <div className="review-box">
              <h3>Review your selections</h3>
              <ul className="review-list">
                {selected.president     && <li>President: {selected.president.name} {selected.president.party ? `(${selected.president.party})` : ''}</li>}
                {selected.vicePresident && <li>Vice President: {selected.vicePresident.name} {selected.vicePresident.party ? `(${selected.vicePresident.party})` : ''}</li>}
                {selected.secretary     && <li>Secretary: {selected.secretary.name} {selected.secretary.party ? `(${selected.secretary.party})` : ''}</li>}
                {selected.treasurer     && <li>Treasurer: {selected.treasurer.name} {selected.treasurer.party ? `(${selected.treasurer.party})` : ''}</li>}
                {selected.members.length > 0 && (
                  <li>Members: {selected.members.map(m => `${m.name}${m.party ? ` (${m.party})` : ''}`).join(', ')}</li>
                )}
              </ul>
              <p className="confirm-text">You are going to vote for the candidate(s) listed above.</p>
              <div className="review-actions">
                <button onClick={backToSelect}>Edit selection</button>
                <button onClick={proceedToVerify}>Continue</button>
              </div>
            </div>
          )}

          {phase === 'verify' && (
            <div className="verify-box">
              <h3>Verify your identity</h3>
              <p>Enter your Voter ID (must match your account):</p>
              <input
                type="text"
                placeholder="Your Voter ID"
                value={voterIdInput}
                onChange={(e) => setVoterIdInput(e.target.value)}
              />
              <div className="verify-actions">
                <button onClick={() => setPhase('review')}>Back</button>
                <button onClick={castAndConfirm} disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Cast vote'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
