import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import api from "../api";
import "./UpdateCandidate.css";

const POS_LABELS = {
  president: "President",
  vicePresident: "Vice President",
  secretary: "Secretary",
  treasurer: "Treasurer",
  members: "Members",
};
const SINGLE_SEAT = ["president","vicePresident","secretary","treasurer"];

function normalizePosition(p = "") {
  const raw = String(p || "").trim();
  const lower = raw.toLowerCase();
  if (lower.startsWith("member")) return "members";
  if (lower === "vicepresident" || lower === "vice president") return "vicePresident";
  if (["president","secretary","treasurer"].includes(lower)) return lower;
  return raw;
}

export default function UpdateCandidate() {
  const [mode, setMode] = useState("existing"); // 'existing' | 'new'

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);

  // ----- EXISTING candidate update/move -----
  const [selectedId, setSelectedId] = useState("");
  const [selected, setSelected] = useState(null);
  const [availExisting, setAvailExisting] = useState(null);
  const [destKeyExisting, setDestKeyExisting] = useState("");
  const [nameExisting, setNameExisting] = useState("");
  const [replacementId, setReplacementId] = useState("");

  // ----- ADD NEW candidate (verified-only) -----
  const [availNew, setAvailNew] = useState(null);
  const [destKeyNew, setDestKeyNew] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [eligible, setEligible] = useState([]); // verified students not already nominated
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const selectedStudent = useMemo(
    () => eligible.find(s => String(s._id) === String(selectedStudentId)) || null,
    [eligible, selectedStudentId]
  );
  const nameNew = selectedStudent?.name || ""; // read-only (from verified user)

  // Back to dashboard (top-left)
  const navigate = useNavigate();
  const { user } = useAuth();
  const backPath = user?.role === "admin"
    ? "/admin-dashboard"
    : user
    ? "/student-dashboard"
    : "/login";

  // initial candidates load
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const res = await api.get("/api/candidates");
        if (!live) return;
        setCandidates(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        alert("Failed to load candidates");
      } finally {
        live && setLoading(false);
      }
    })();
    return () => { live = false; };
  }, []);

  // when switching to "new", fetch empties (no candidateId) + initial eligible verified students
  useEffect(() => {
    if (mode !== "new") return;
    (async () => {
      try {
        const r1 = await api.get("/api/candidates/available-slots");
        setAvailNew(r1.data);
        setDestKeyNew((r1.data.flat && r1.data.flat[0]?.key) || "");
        const eid = r1.data?.electionId;
        const r2 = await api.get("/api/candidates/eligible-students", { params: { electionId: eid, q: "" }});
        setEligible(r2.data?.students || []);
        setSelectedStudentId("");
      } catch (e) {
        console.error("init add-new failed:", e?.response?.data || e.message);
        alert("Failed to load data for Add New Candidate");
      }
    })();
  }, [mode]);

  // search eligible verified students (debounced)
  useEffect(() => {
    if (mode !== "new") return;
    const t = setTimeout(async () => {
      try {
        const eid = availNew?.electionId;
        const r = await api.get("/api/candidates/eligible-students", { params: { electionId: eid, q: searchQ } });
        setEligible(r.data?.students || []);
      } catch (e) {
        console.error("eligible search failed:", e?.response?.data || e.message);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [mode, searchQ, availNew?.electionId]);

  // when candidate changes in existing mode
  useEffect(() => {
    if (mode !== "existing") return;
    if (!selectedId) {
      setSelected(null);
      setAvailExisting(null);
      setDestKeyExisting("");
      setNameExisting("");
      setReplacementId("");
      return;
    }
    const c = candidates.find(x => String(x._id) === String(selectedId));
    setSelected(c || null);
    setReplacementId("");
    if (!c) { setAvailExisting(null); setDestKeyExisting(""); setNameExisting(""); return; }

    setNameExisting(c.name || "");

    (async () => {
      try {
        const r = await api.get("/api/candidates/available-slots", {
          params: { electionId: c.electionId, candidateId: c._id }
        });
        setAvailExisting(r.data);

        // prefer keeping current seat if shown; else pick first empty
        const currPos = normalizePosition(c.position);
        const currParty = c.partyName === "Independent" ? null : (c.partyName || "");
        const currKey = currParty ? `party:${currParty}:${currPos}` : `independent:${currPos}`;
        const exists = (r.data.flat || []).some(f => f.key === currKey);
        setDestKeyExisting(exists ? currKey : ((r.data.flat || [])[0]?.key || ""));
      } catch (e) {
        console.error("available-slots (existing) failed:", e?.response?.data || e.message);
        alert("Failed to fetch available slots");
      }
    })();
  }, [mode, selectedId, candidates]);

  // helpers for existing replacement
  const sourceIsPartySingleSeat = useMemo(() => {
    if (!selected) return false;
    const pos = normalizePosition(selected.position);
    return selected.partyName && selected.partyName !== "Independent" && SINGLE_SEAT.includes(pos);
  }, [selected]);

  const replacementChoices = useMemo(() => {
    if (!sourceIsPartySingleSeat) return [];
    const party = selected.partyName;
    return candidates.filter(c =>
      c.partyName === party &&
      normalizePosition(c.position) === "members" &&
      String(c._id) !== String(selected._id)
    );
  }, [sourceIsPartySingleSeat, candidates, selected]);

  // ----- submit handlers -----
  const [submitting, setSubmitting] = useState(false);

  // existing submit (move/update)
  const handleSubmitExisting = async (e) => {
    e.preventDefault();
    if (!selected || !destKeyExisting || !nameExisting.trim()) return;

    const [kind, maybeParty, maybeSlot] = destKeyExisting.split(":");
    const destType = kind === "party" ? "party" : "independent";
    const destPartyName = destType === "party" ? maybeParty : null;
    const destSlot = destType === "party" ? maybeSlot : maybeParty;

    setSubmitting(true);
    try {
      const payload = { name: nameExisting.trim() };
      if (destType === "party") {
        payload.partyName = destPartyName;
        payload.position = destSlot;
      } else {
        payload.position = "independent";
        payload.post = destSlot;
      }
      if (sourceIsPartySingleSeat && replacementId) {
        payload.replacementCandidateId = replacementId;
      }

      await api.put(`/api/candidates/${selected._id}`, payload);
      alert("Candidate updated successfully.");

      const res = await api.get("/api/candidates");
      setCandidates(Array.isArray(res.data) ? res.data : []);

      const r2 = await api.get("/api/candidates/available-slots", { params: { electionId: selected.electionId, candidateId: selected._id } });
      setAvailExisting(r2.data);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      alert(`Update failed: ${msg}`);
      console.error("Update failed:", err?.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // new candidate submit (assign verified student to empty seat)
  const handleSubmitNew = async (e) => {
    e.preventDefault();
    if (!destKeyNew || !selectedStudentId) return;

    const [kind, maybeParty, maybeSlot] = destKeyNew.split(":");
    const type = kind === "party" ? "party" : "independent";
    const partyName = type === "party" ? maybeParty : null;
    const slot = type === "party" ? maybeSlot : maybeParty;

    setSubmitting(true);
    try {
      const payload = {
        electionId: availNew?.electionId,
        type,
        partyName,
        slot,
        candidateUserId: selectedStudentId, // verified student id
      };

      await api.post(`/api/candidates/assign`, payload);
      alert("New candidate assigned to seat.");

      // refresh lists + empties + eligible (since one student is now used)
      const res = await api.get("/api/candidates");
      setCandidates(Array.isArray(res.data) ? res.data : []);

      const r1 = await api.get("/api/candidates/available-slots");
      setAvailNew(r1.data);
      setDestKeyNew((r1.data.flat && r1.data.flat[0]?.key) || "");

      const r2 = await api.get("/api/candidates/eligible-students", { params: { electionId: r1.data?.electionId, q: searchQ } });
      setEligible(r2.data?.students || []);
      setSelectedStudentId("");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      alert(`Assign failed: ${msg}`);
      console.error("Assign failed:", err?.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ----- render -----
  if (loading) {
    return (
      <div className="update-candidate-container">
        {/* Back button (not sticky; scrolls with content) */}
        <button
          type="button"
          className="back-top-btn"
          onClick={() => navigate(backPath)}
          aria-label="Back to Dashboard"
        >
          ← Back to Dashboard
        </button>
        <h1>Update Candidate</h1>
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="update-candidate-container">
      {/* Back button (top-left, not fixed) */}
      <button
        type="button"
        className="back-top-btn"
        onClick={() => navigate(backPath)}
        aria-label="Back to Dashboard"
      >
        ← Back to Dashboard
      </button>

      <div className="header">
        <h1>Update / Add Candidate</h1>
        <p>Move existing candidates or assign a brand-new <b>verified student</b> into any <b>empty</b> seat (including Members).</p>
      </div>

      {/* Mode toggle */}
      <div className="card">
        <label className="label">Mode</label>
        <div className="toggle">
          <label>
            <input type="radio" name="mode" value="existing" checked={mode === "existing"} onChange={() => setMode("existing")} />
            <span>Move / Update Existing</span>
          </label>
          <label>
            <input type="radio" name="mode" value="new" checked={mode === "new"} onChange={() => setMode("new")} />
            <span>Add New Candidate</span>
          </label>
        </div>
      </div>

      {mode === "existing" && (
        <>
          {/* Pick candidate */}
          <div className="card">
            <label className="label">Candidate</label>
            <select className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="">-- Choose --</option>
              {candidates.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} — {(c.partyName || "Party")} — {c.position}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <form className="card form" onSubmit={handleSubmitExisting}>
              <div className="row">
                <div className="col">
                  <label className="label">Name</label>
                  <input className="input" value={nameExisting} onChange={e => setNameExisting(e.target.value)} placeholder="Candidate name" />
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <label className="label">Move To (empty seats only)</label>
                  <select
                    className="input"
                    value={destKeyExisting}
                    onChange={e => setDestKeyExisting(e.target.value)}
                    disabled={!availExisting || !(availExisting.flat || []).length}
                  >
                    <option value="">-- Select destination --</option>
                    {availExisting?.flat && (() => {
                      const partyGroups = {};
                      const independent = [];
                      for (const f of availExisting.flat) {
                        if (f.type === "party") {
                          partyGroups[f.partyName] = partyGroups[f.partyName] || [];
                          partyGroups[f.partyName].push(f);
                        } else {
                          independent.push(f);
                        }
                      }
                      const groups = [];
                      for (const pname of Object.keys(partyGroups)) {
                        groups.push(
                          <optgroup key={`pg-${pname}`} label={`Party — ${pname}`}>
                            {partyGroups[pname].map(f => (
                              <option key={f.key} value={f.key}>
                                {POS_LABELS[f.slot] || f.slot} {f.slot === "members" && f.seats != null ? `(${f.seats})` : ""}
                              </option>
                            ))}
                          </optgroup>
                        );
                      }
                      if (independent.length) {
                        groups.push(
                          <optgroup key="ind" label="Independent">
                            {independent.map(f => (
                              <option key={f.key} value={f.key}>
                                {POS_LABELS[f.slot] || f.slot} {f.slot === "members" && f.seats != null ? `(${f.seats})` : ""}
                              </option>
                            ))}
                          </optgroup>
                        );
                      }
                      return groups;
                    })()}
                  </select>
                </div>
              </div>

              {sourceIsPartySingleSeat && (
                <div className="row">
                  <div className="col">
                    <label className="label">Replacement for vacated seat (optional)</label>
                    <select className="input" value={replacementId} onChange={e => setReplacementId(e.target.value)}>
                      <option value="">-- No replacement --</option>
                      {replacementChoices.map(m => (
                        <option key={m._id} value={m._id}>{m.name} — Member</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="actions">
                <button className="btn" type="submit" disabled={submitting || !nameExisting.trim() || !destKeyExisting}>
                  {submitting ? "Updating…" : "Update Candidate"}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {mode === "new" && (
        <form className="card form" onSubmit={handleSubmitNew}>
          <div className="row">
            <div className="col">
              <label className="label">Search Verified Students</label>
              <input
                className="input"
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="Type name to search…"
              />
            </div>
            <div className="col">
              <label className="label">Select Student (verified, not already a candidate)</label>
              <select
                className="input"
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
              >
                <option value="">-- Choose student --</option>
                {eligible.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.name} {s.program ? `— ${s.program}` : ''} {s.faculty ? `(${s.faculty})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col">
              <label className="label">Student Name</label>
              <input className="input" value={nameNew} readOnly placeholder="(auto from verified student)" />
            </div>
            <div className="col">
              <label className="label">Assign To (empty seats only)</label>
              <select
                className="input"
                value={destKeyNew}
                onChange={e => setDestKeyNew(e.target.value)}
                disabled={!availNew || !(availNew.flat || []).length}
              >
                <option value="">-- Select destination --</option>
                {availNew?.flat && (() => {
                  const partyGroups = {};
                  const independent = [];
                  for (const f of availNew.flat) {
                    if (f.type === "party") {
                      partyGroups[f.partyName] = partyGroups[f.partyName] || [];
                      partyGroups[f.partyName].push(f);
                    } else {
                      independent.push(f);
                    }
                  }
                  const groups = [];
                  for (const pname of Object.keys(partyGroups)) {
                    groups.push(
                      <optgroup key={`pg-${pname}`} label={`Party — ${pname}`}>
                        {partyGroups[pname].map(f => (
                          <option key={f.key} value={f.key}>
                            { (f.slot === 'members' ? 'Members' : (f.slot === 'vicePresident' ? 'Vice President' : f.slot[0].toUpperCase() + f.slot.slice(1))) }
                            { f.slot === "members" && f.seats != null ? ` (${f.seats})` : "" }
                          </option>
                        ))}
                      </optgroup>
                    );
                  }
                  if (independent.length) {
                    groups.push(
                      <optgroup key="ind" label="Independent">
                        {independent.map(f => (
                          <option key={f.key} value={f.key}>
                            { (f.slot === 'members' ? 'Members' : (f.slot === 'vicePresident' ? 'Vice President' : f.slot[0].toUpperCase() + f.slot.slice(1))) }
                            { f.slot === "members" && f.seats != null ? ` (${f.seats})` : "" }
                          </option>
                        ))}
                      </optgroup>
                    );
                  }
                  return groups;
                })()}
              </select>
              {!availNew?.flat?.length && <p className="hint">No empty seats available.</p>}
            </div>
          </div>

          <div className="actions">
            <button className="btn" type="submit" disabled={submitting || !selectedStudentId || !destKeyNew}>
              {submitting ? "Assigning…" : "Assign New Candidate"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

