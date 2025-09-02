// import React, { useEffect, useMemo, useState } from "react";
// import api from "../api";
// import "./DeleteApprovedPosts.css";

// function normalizeServerPath(p) {
//   if (!p) return "";
//   let path = String(p).replace(/\\/g, "/");
//   if (/^https?:\/\//i.test(path)) return path;
//   if (!path.startsWith("/")) path = `/${path}`;
//   if (path.toLowerCase().includes("/uploads/")) return path;
//   return `/uploads/${path.replace(/^\/+/, "")}`;
// }
// function absoluteUrl(p) {
//   if (!p) return "";
//   const norm = normalizeServerPath(p);
//   if (/^https?:\/\//i.test(norm)) return norm;
//   const base = (api.defaults.baseURL || "").replace(/\/$/, "");
//   return `${base}${norm}`;
// }

// export default function DeleteApprovedPosts() {
//   const [posts, setPosts] = useState([]);
//   const [q, setQ] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [deleting, setDeleting] = useState(null);

//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         // This returns all approved posts (public)
//         const res = await api.get("/api/post/all-approved");
//         if (alive) setPosts(Array.isArray(res.data) ? res.data : []);
//       } catch (e) {
//         console.error("Failed to load approved posts:", e?.response?.data || e.message);
//         alert("Failed to load approved posts");
//       } finally {
//         if (alive) setLoading(false);
//       }
//     })();
//     return () => { alive = false; };
//   }, []);

//   const filtered = useMemo(() => {
//     const s = q.trim().toLowerCase();
//     if (!s) return posts;
//     return posts.filter(p =>
//       (p.content || "").toLowerCase().includes(s) ||
//       (p.userId?.name || "").toLowerCase().includes(s) ||
//       (p.category || "").toLowerCase().includes(s)
//     );
//   }, [q, posts]);

//   const handleDelete = async (id) => {
//     const ok = window.confirm("Delete this post permanently?");
//     if (!ok) return;
//     setDeleting(id);
//     try {
//       // Admin-only endpoint we added
//       await api.delete(`/api/post/${id}/force`);
//       setPosts(prev => prev.filter(p => String(p._id) !== String(id)));
//     } catch (e) {
//       const msg = e?.response?.data?.error || e?.response?.data?.message || e.message;
//       console.error("Delete failed:", e?.response?.data || e.message);
//       alert(`Delete failed: ${msg}`);
//     } finally {
//       setDeleting(null);
//     }
//   };

//   if (loading) return <div className="dap-wrap"><h1>Delete Approved Posts</h1><p>Loading…</p></div>;

//   return (
//     <div className="dap-wrap">
//       <div className="dap-header">
//         <h1>Delete Approved Posts</h1>
//         <input
//           className="dap-search"
//           placeholder="Search by content, author, or category…"
//           value={q}
//           onChange={e => setQ(e.target.value)}
//         />
//       </div>

//       {filtered.length === 0 ? (
//         <p>No matching approved posts.</p>
//       ) : (
//         <div className="dap-grid">
//           {filtered.map(p => (
//             <div className="dap-card" key={p._id}>
//               <div className="dap-row">
//                 <div className="dap-author">
//                   <img
//                     src={absoluteUrl(p.userId?.photo)}
//                     alt={p.userId?.name || "User"}
//                     onError={(e) => { e.currentTarget.src = "/default-profile.png"; }}
//                   />
//                   <div>
//                     <div className="dap-name">{p.userId?.name || "User"}</div>
//                     <div className="dap-meta">
//                       <span>{new Date(p.createdAt).toLocaleString()}</span>
//                       {p.category && <span>• {p.category}</span>}
//                     </div>
//                   </div>
//                 </div>
//                 <button
//                   className="dap-danger"
//                   disabled={deleting === p._id}
//                   onClick={() => handleDelete(p._id)}
//                 >
//                   {deleting === p._id ? "Deleting…" : "Delete"}
//                 </button>
//               </div>

//               <div className="dap-content">{p.content}</div>

//               {p.image && (
//                 <div className="dap-image">
//                   <img
//                     src={absoluteUrl(p.image)}
//                     alt="post"
//                     loading="lazy"
//                     onError={(e) => { e.currentTarget.style.display = "none"; }}
//                   />
//                 </div>
//               )}

//               <div className="dap-stats">
//                 <span>👍 {p.likes?.length || 0}</span>
//                 <span>👎 {p.dislikes?.length || 0}</span>
//                 <span>💬 {p.comments?.length || 0}</span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import api from "../api";
import "./DeleteApprovedPosts.css";

function normalizeServerPath(p) {
  if (!p) return "";
  let path = String(p).replace(/\\/g, "/");
  if (/^https?:\/\//i.test(path)) return path;
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.toLowerCase().includes("/uploads/")) return path;
  return `/uploads/${path.replace(/^\/+/, "")}`;
}
function absoluteUrl(p) {
  if (!p) return "";
  const norm = normalizeServerPath(p);
  if (/^https?:\/\//i.test(norm)) return norm;
  const base = (api.defaults.baseURL || "").replace(/\/$/, "");
  return `${base}${norm}`;
}

export default function DeleteApprovedPosts() {
  const [posts, setPosts] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  // Back to dashboard
  const navigate = useNavigate();
  const { user } = useAuth();
  const backPath =
    user?.role === "admin" ? "/admin-dashboard" : user ? "/student-dashboard" : "/login";

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // All approved posts (public)
        const res = await api.get("/api/post/all-approved");
        if (alive) setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error("Failed to load approved posts:", e?.response?.data || e.message);
        alert("Failed to load approved posts");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return posts;
    return posts.filter(
      (p) =>
        (p.content || "").toLowerCase().includes(s) ||
        (p.userId?.name || "").toLowerCase().includes(s) ||
        (p.category || "").toLowerCase().includes(s)
    );
  }, [q, posts]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this post permanently?");
    if (!ok) return;
    setDeleting(id);
    try {
      // Admin-only endpoint
      await api.delete(`/api/post/${id}/force`);
      setPosts((prev) => prev.filter((p) => String(p._id) !== String(id)));
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e.message;
      console.error("Delete failed:", e?.response?.data || e.message);
      alert(`Delete failed: ${msg}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading)
    return (
      <div className="dap-wrap">
        <button
          type="button"
          className="back-top-btn"
          onClick={() => navigate(backPath)}
          aria-label="Back to Dashboard"
        >
          ← Back to Dashboard
        </button>
        <h1>Delete Approved Posts</h1>
        <p>Loading…</p>
      </div>
    );

  return (
    <div className="dap-wrap">
      {/* Top-left back button (not sticky) */}
      <button
        type="button"
        className="back-top-btn"
        onClick={() => navigate(backPath)}
        aria-label="Back to Dashboard"
      >
        ← Back to Dashboard
      </button>

      <div className="dap-header">
        <h1>Delete Approved Posts</h1>
        <input
          className="dap-search"
          placeholder="Search by content, author, or category…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p>No matching approved posts.</p>
      ) : (
        <div className="dap-grid">
          {filtered.map((p) => (
            <div className="dap-card" key={p._id}>
              <div className="dap-row">
                <div className="dap-author">
                  <img
                    src={absoluteUrl(p.userId?.photo)}
                    alt={p.userId?.name || "User"}
                    onError={(e) => {
                      e.currentTarget.src = "/default-profile.png";
                    }}
                  />
                  <div>
                    <div className="dap-name">{p.userId?.name || "User"}</div>
                    <div className="dap-meta">
                      <span>{new Date(p.createdAt).toLocaleString()}</span>
                      {p.category && <span>• {p.category}</span>}
                    </div>
                  </div>
                </div>
                <button
                  className="dap-danger"
                  disabled={deleting === p._id}
                  onClick={() => handleDelete(p._id)}
                >
                  {deleting === p._id ? "Deleting…" : "Delete"}
                </button>
              </div>

              <div className="dap-content">{p.content}</div>

              {p.image && (
                <div className="dap-image">
                  <img
                    src={absoluteUrl(p.image)}
                    alt="post"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="dap-stats">
                <span>👍 {p.likes?.length || 0}</span>
                <span>👎 {p.dislikes?.length || 0}</span>
                <span>💬 {p.comments?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
