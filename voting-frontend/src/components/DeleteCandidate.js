import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; // your axios instance
import { useAuth } from "../AuthContext";
import "./DeleteCandidate.css";

const DeleteCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { user } = useAuth();

  const backPath = user?.role === "admin"
    ? "/admin-dashboard"
    : user
    ? "/student-dashboard"
    : "/login";

  // Fetch all candidates
  const fetchCandidates = async () => {
    try {
      const res = await api.get("/api/candidates");
      setCandidates(res.data);
    } catch (error) {
      console.error("Error fetching candidates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete candidate by ID
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this candidate?")) return;

    try {
      await api.delete(`/api/candidates/${id}`);
      setCandidates((prev) => prev.filter((c) => c._id !== id));
      alert("Candidate deleted successfully");
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("Failed to delete candidate");
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        {/* Keep back button visible during loading */}
        <button
          type="button"
          className="back-floating-btn"
          onClick={() => navigate(backPath)}
          aria-label="Back to Dashboard"
        >
          ← Back to Dashboard
        </button>

        <div className="loading-spinner"></div>
        <p>Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="delete-candidate-container">
      {/* Top-left back button */}
      <button
        type="button"
        className="back-floating-btn"
        onClick={() => navigate(backPath)}
        aria-label="Back to Dashboard"
      >
        ← Back to Dashboard
      </button>

      <h1>Delete Candidates</h1>

      {candidates.length === 0 ? (
        <p>No candidates found.</p>
      ) : (
        <div className="candidates-grid">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="candidate-card">
              <div className="candidate-header">
                <div className="candidate-avatar">
                  {candidate.name ? candidate.name[0] : "C"}
                </div>
                <h3 className="candidate-name">{candidate.name}</h3>
                <p className="candidate-position">
                  Position: {candidate.position || "Not provided"}
                </p>
                <p className="candidate-party">
                  Party: {candidate.partyName ? candidate.partyName : "Independent"}
                </p>
              </div>
              <button
                className="delete-btn"
                onClick={() => handleDelete(candidate._id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeleteCandidate;
