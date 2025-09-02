import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./ResetUserPassword.css";

export default function ResetUserPassword() {
  const navigate = useNavigate();

  const [verified, setVerified] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [resettingId, setResettingId] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api.get("/api/users/verified");
        if (!alive) return;
        const list = Array.isArray(res.data) ? res.data : [];
        const clean = list
          .filter(u => u?.isVerified)
          .map(u => ({
            _id: String(u._id),
            name: u.name || "",
            email: u.email || "",
            symbolNumber: u.symbolNumber || "",
            faculty: u.faculty || "",
            program: u.program || "",
            role: u.role || "student",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setVerified(clean);
      } catch (e) {
        console.error("Failed to load verified students:", e?.response?.data || e.message);
        alert("Failed to load verified students.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return verified;
    return verified.filter(u =>
      (u.name || "").toLowerCase().includes(s) ||
      (u.email || "").toLowerCase().includes(s) ||
      (u.symbolNumber || "").toLowerCase().includes(s)
    );
  }, [q, verified]);

  const resetPassword = async (userId) => {
    const user = verified.find(v => v._id === userId);
    const label = user ? `${user.name} (${user.email})` : "this user";
    const ok = window.confirm(`Reset password for ${label}? A new temporary password will be emailed.`);
    if (!ok) return;

    setResettingId(userId);
    try {
      await api.post("/api/auth/admin/reset-password", { userId });
      alert("Password reset and emailed to the user.");
      // ⬇️ Redirect to Admin Dashboard after success
      navigate("/admin-dashboard", { replace: true });
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e.message;
      console.error("Reset failed:", e?.response?.data || e.message);
      alert(`Reset failed: ${msg}`);
    } finally {
      setResettingId(null);
    }
  };

  return (
    <div className="urp-wrap">
      {/* Top-left back button */}
      <button className="back-btn" onClick={() => navigate("/admin-dashboard")}>
        ← Back to Dashboard
      </button>

      <h1>Reset User Password</h1>
      <p className="urp-sub">
        Select a <b>verified</b> student below (or search) and reset their password.
      </p>

      <div className="urp-controls">
        <input
          className="urp-search"
          placeholder="Search by name, email, or roll…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading verified students…</p>
      ) : filtered.length === 0 ? (
        <p>No matching verified students.</p>
      ) : (
        <div className="urp-grid">
          {filtered.map(u => (
            <div key={u._id} className="urp-card">
              <div className="urp-top">
                <div className="urp-name">{u.name}</div>
                <div className="urp-badge ok">Verified</div>
              </div>

              <div className="urp-meta">
                <div><b>Email:</b> {u.email}</div>
                <div><b>Roll:</b> {u.symbolNumber || "—"}</div>
                <div><b>Faculty/Program:</b> {[u.faculty, u.program].filter(Boolean).join(" • ") || "—"}</div>
              </div>

              <button
                className="urp-danger"
                disabled={resettingId === u._id}
                onClick={() => resetPassword(u._id)}
              >
                {resettingId === u._id ? "Resetting…" : "Reset & Email Password"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
