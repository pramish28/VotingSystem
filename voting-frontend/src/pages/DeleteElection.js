// import React, { useEffect, useState } from "react";
// import api from "../api";
// import "./DeleteElection.css";

// function fmt(d) {
//   if (!d) return "";
//   const dt = new Date(d);
//   if (Number.isNaN(dt.getTime())) return String(d);
//   return dt.toLocaleDateString();
// }

// export default function DeleteElection() {
//   const [loading, setLoading] = useState(true);
//   const [elections, setElections] = useState([]);
//   const [deletingId, setDeletingId] = useState(null);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get("/api/election"); // protected by admin auth
//       setElections(Array.isArray(res.data) ? res.data : []);
//     } catch (e) {
//       console.error("Load elections failed:", e?.response?.data || e.message);
//       alert("Failed to load elections");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { load(); }, []);

//   const handleDelete = async (id) => {
//     const ok = window.confirm(
//       "This will permanently delete this election and all of its votes.\n\nAre you sure?"
//     );
//     if (!ok) return;

//     setDeletingId(id);
//     try {
//       await api.delete(`/api/election/${id}`);
//       setElections((prev) => prev.filter((e) => String(e._id) !== String(id)));
//       alert("Election deleted.");
//     } catch (e) {
//       const msg = e?.response?.data?.message || e.message;
//       alert(`Delete failed: ${msg}`);
//       console.error("Delete failed:", e?.response?.data || e.message);
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   return (
//     <div className="delete-election-container">
//       <div className="header">
//         <h1>Delete Election</h1>
//         <p>Remove an entire election and its votes.</p>
//       </div>

//       {loading ? (
//         <div className="loading">Loading elections…</div>
//       ) : elections.length === 0 ? (
//         <p>No elections found.</p>
//       ) : (
//         <div className="election-list">
//           {elections.map((e) => (
//             <div key={e._id} className="election-card">
//               <div className="election-info">
//                 <h3 className="title">{e.electionTitle}</h3>
//                 <div className="meta">
//                   <span>Start: {fmt(e.startDate)}</span>
//                   <span>End: {fmt(e.endDate)}</span>
//                   <span>Created: {fmt(e.createdAt)}</span>
//                 </div>
//               </div>
//               <button
//                 className="danger-btn"
//                 disabled={deletingId === e._id}
//                 onClick={() => handleDelete(e._id)}
//               >
//                 {deletingId === e._id ? "Deleting…" : "Delete"}
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import api from "../api";
import "./DeleteElection.css";

function fmt(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString();
}

export default function DeleteElection() {
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // Back to dashboard
  const navigate = useNavigate();
  const { user } = useAuth();
  const backPath = user?.role === "admin" ? "/admin-dashboard" : user ? "/student-dashboard" : "/login";

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/election"); // protected by admin auth
      setElections(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Load elections failed:", e?.response?.data || e.message);
      alert("Failed to load elections");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "This will permanently delete this election and all of its votes.\n\nAre you sure?"
    );
    if (!ok) return;

    setDeletingId(id);
    try {
      await api.delete(`/api/election/${id}`);
      setElections((prev) => prev.filter((e) => String(e._id) !== String(id)));
      alert("Election deleted.");
    } catch (e) {
      const msg = e?.response?.data?.message || e.message;
      alert(`Delete failed: ${msg}`);
      console.error("Delete failed:", e?.response?.data || e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="delete-election-container">
      {/* Top-left back button (not sticky) */}
      <button
        type="button"
        className="back-top-btn"
        onClick={() => navigate(backPath)}
        aria-label="Back to Dashboard"
      >
        ← Back to Dashboard
      </button>

      <div className="header">
        <h1>Delete Election</h1>
        <p>Remove an entire election and its votes.</p>
      </div>

      {loading ? (
        <div className="loading">Loading elections…</div>
      ) : elections.length === 0 ? (
        <p>No elections found.</p>
      ) : (
        <div className="election-list">
          {elections.map((e) => (
            <div key={e._id} className="election-card">
              <div className="election-info">
                <h3 className="title">{e.electionTitle}</h3>
                <div className="meta">
                  <span>Start: {fmt(e.startDate)}</span>
                  <span>End: {fmt(e.endDate)}</span>
                  <span>Created: {fmt(e.createdAt)}</span>
                </div>
              </div>
              <button
                className="danger-btn"
                disabled={deletingId === e._id}
                onClick={() => handleDelete(e._id)}
              >
                {deletingId === e._id ? "Deleting…" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
