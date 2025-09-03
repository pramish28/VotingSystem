import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UpdateStudent.css";

const API = "http://localhost:5000";

export default function UpdateStudent() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/users/verified`);
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.name, s.email, s.symbolNumber, s.faculty, s.program, s.degree]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [students, search]);

  const goEdit = (student) => {
    // Navigate in the SAME TAB and pass the student via router state
    navigate(`/edit-student/${student._id}`, { state: { student } });
  };

  const goDashboard = () => {
   
    navigate("/admin-dashboard");
  };

  return (
    <div className="us-page">
      <header className="us-header">
        <div className="us-left">
          <button className="us-btn us-back" onClick={goDashboard}>
            ← Back to Dashboard
          </button>
          <h2>Update Verified Students</h2>
        </div>

        <div className="us-actions">
          <div className="us-search">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, roll, faculty, program…"
              aria-label="Search verified students"
            />
            {search && (
              <button
                className="us-search-clear"
                onClick={() => setSearch("")}
                title="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <button className="us-btn us-refresh" onClick={fetchStudents}>
            Refresh
          </button>
        </div>
      </header>

      {loading ? (
        <div className="us-loading">
          <div className="us-spinner" />
          <p>Loading students…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="us-empty">
          {search ? (
            <p>No verified students match “{search}”.</p>
          ) : (
            <p>No verified students found.</p>
          )}
        </div>
      ) : (
        <>
          <div className="us-meta">
            Showing <strong>{filtered.length}</strong> of{" "}
            <strong>{students.length}</strong> verified students
          </div>

          <div className="us-grid">
            {filtered.map((s) => (
              <article
                key={s._id}
                className="us-card"
                role="button"
                tabIndex={0}
                onClick={() => goEdit(s)}
                onKeyDown={(e) => e.key === "Enter" && goEdit(s)}
                title="Click to edit"
              >
                <div className="us-card-head">
                  <img
                    className="us-avatar"
                    src={s.photo ? `${API}/${s.photo}` : "/default-avatar.png"}
                    alt={s.name || "Student photo"}
                    loading="lazy"
                  />
                  <div className="us-head-main">
                    <h3 className="us-name" title={s.name}>
                      {s.name}
                    </h3>
                    <div className="us-line">
                      <span className="us-label">Email:</span>
                      <span className="us-value" title={s.email}>
                        {s.email}
                      </span>
                    </div>
                    <div className="us-line">
                      <span className="us-label">Roll:</span>
                      <span className="us-value">{s.symbolNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="us-card-body">
                  <div className="us-kv">
                    <span>Degree:</span>
                    <strong title={s.degree}>{s.degree}</strong>
                  </div>
                  <div className="us-kv">
                    <span>Faculty:</span>
                    <strong title={s.faculty}>{s.faculty}</strong>
                  </div>
                  <div className="us-kv">
                    <span>Program:</span>
                    <strong title={s.program}>{s.program}</strong>
                  </div>
                  <div className="us-kv">
                    <span>Major:</span>
                    <strong title={s.major || "N/A"}>{s.major || "N/A"}</strong>
                  </div>
                  <div className="us-kv">
                    <span>Year/Sem:</span>
                    <strong>{s.yearOrSemester}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
