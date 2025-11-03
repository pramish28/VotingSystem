import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";
import {
  listAllElections,
  downloadResultsPdf,
  shareResultsSummaryPdf,
  exportAllElectionsPdf,
} from "../api";

const Settings = () => {
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [busy, setBusy] = useState(false);

  const selected = useMemo(
    () => elections.find(e => String(e._id) === String(selectedId)) || elections[0],
    [elections, selectedId]
  );

  useEffect(() => {
    (async () => {
      try {
        const items = await listAllElections();
        setElections(items || []);
        if (items?.length) setSelectedId(String(items[0]._id));
      } catch (e) {
        console.error("Failed to load elections:", e);
      }
    })();
  }, []);

  const handleDownloadPdf = async () => {
    if (!selected) return alert("No election selected.");
    try {
      setBusy(true);
      const res = await downloadResultsPdf(selected._id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
      const safeTitle = (selected.electionTitle || 'Election').replace(/[^\w\-]+/g,'_');
      a.href = url;
      a.download = 'TU_Results_' + safeTitle + '_' + selected._id + '_' + ts + '.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download failed:', err);
      alert('Failed to download PDF.');
    } finally {
      setBusy(false);
    }
  };

  const handlePublishPdf = async () => {
    if (!selected) return alert("No election selected.");
    const note = window.prompt("Optional note to include in the post:", "Official Results Summary");
    try {
      setBusy(true);
      await shareResultsSummaryPdf(selected._id, note || "");
      alert("Results Summary (PDF) post published.");
      // navigate("/view-posts"); // optional
    } catch (err) {
      console.error('Share PDF failed:', err);
      alert(err?.response?.data?.message || 'Failed to publish Results Summary (PDF).');
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadAllPdf = async () => {
    try {
      setBusy(true);
      const files = await exportAllElectionsPdf(); // [{url, title, filename, electionId}]
      if (!files.length) {
        alert("No elections found.");
        return;
      }
      let idx = 0;
      const downloadNext = () => {
        if (idx >= files.length) return;
        const f = files[idx++];
        const a = document.createElement('a');
        a.href = f.url.startsWith('http') ? f.url : (window.location.origin + f.url);
        a.download = f.filename || ('results_' + f.electionId + '.pdf');
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(downloadNext, 180);
      };
      downloadNext();
    } catch (err) {
      console.error('Download-all PDFs failed:', err);
      alert('Failed to prepare PDFs.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="header-section">
        <button className="back-btn" onClick={() => navigate("/admin-dashboard")}>
          ← Back to Dashboard
        </button>
        <h1>Settings</h1>
        <p className="settings-description">Manage candidates, elections, and verified students.</p>
      </div>

      {/* PDF-only Export & Share */}
      <div className="export-share-panel">
        <div className="esp-row">
          <h2>Export & Share Votes (PDF)</h2>
          <span className="esp-hint">
            PDF includes per-candidate: <em>Position, Name, Party, Votes, Percentage</em>
          </span>
        </div>

        <div className="esp-controls">
          <label className="esp-label">
            Election
            <select
              className="esp-select"
              value={selected ? selected._id : ""}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={!elections.length || busy}
            >
              {elections.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.electionTitle} — {new Date(e.startDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </label>

          <div className="esp-buttons">
            <button className="esp-btn primary" onClick={handleDownloadPdf} disabled={!selected || busy}>
              ⬇️ Download PDF
            </button>
            <button className="esp-btn success" onClick={handlePublishPdf} disabled={!selected || busy}>
              📰 Publish Results Summary (PDF)
            </button>
            <button className="esp-btn ghost" onClick={handleDownloadAllPdf} disabled={!elections.length || busy}>
              ⬇️ Download ALL (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* your existing cards unchanged */}
      <div className="settings-grid">
        <div className="setting-card delete-candidate" onClick={() => navigate("/delete-candidate")}>
          <h3>Delete Candidate</h3>
          <p>Remove a candidate from the election.</p>
        </div>

        <div className="setting-card update-candidate" onClick={() => navigate("/update-candidate")}>
          <h3>Update Candidate</h3>
          <p>Edit candidate details or position.</p>
        </div>

        <div className="setting-card delete-election" onClick={() => navigate("/delete-election")}>
          <h3>Delete Election</h3>
          <p>Remove an entire election.</p>
        </div>

        <div className="setting-card delete-verified-student" onClick={() => navigate("/delete-student")}>
          <h3>Delete Verified Student</h3>
          <p>Remove a verified student from the database.</p>
        </div>

        <div className="setting-card update-verified-student" onClick={() => navigate("/update-student")}>
          <h3>Update Verified Student</h3>
          <p>Edit details of verified students.</p>
        </div>

        <div className="setting-card delete-approved-posts" onClick={() => navigate("/delete-approved-posts")}>
          <h3>Delete Approved Posts</h3>
          <p>Remove approved posts from the feed.</p>
        </div>

        <div className="setting-card reset-user-password" onClick={() => navigate("/reset-user-password")}>
          <h3>Reset User Password</h3>
          <p>Send a new password to the user by email.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;