import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Candidates.css"; // you can reuse the same CSS
import api from "../api";

const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchCandidates();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading candidates...</p>
      </div>
    );
  }

  return (
    <div className="candidates-container">
      <div className="header-section">
        <button
          className="back-btn"
          onClick={() => navigate("/admin-dashboard")}
        >
          ← Back to Dashboard
        </button>
        <h1>Candidates</h1>
        <div className="candidates-count">
          {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="no-candidates">
          <div className="no-candidates-icon">🔍</div>
          <h3>No Candidates</h3>
          <p>No candidate records to show right now.</p>
        </div>
      ) : (
        <div className="candidates-grid">
          {candidates.map((candidate) => (
            <div key={candidate._id} className="candidate-card">
              <div className="card-header">
                <div className="profile-section">
                  <div className="profile-photo-container">
                    <div
                      className={`candidate-avatar ${candidate.color || "bg-blue-600"}`}
                    >
                      {candidate.name ? candidate.name[0] : "C"}
                    </div>
                  </div>
                  <div className="candidate-basic-info">
                    <h3 className="candidate-name">{candidate.name}</h3>
                    <p className="candidate-id">Position: {candidate.position}</p>

                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="student-details">
                  <div className="detail-row">
                    <span className="detail-label">Party Name:</span>
                    <span className="detail-value">{candidate.partyName || "Independent"}</span>
                  </div>
                 
                  <div className="detail-row">
                    <span className="detail-label">Election ID:</span>
                    <span className="detail-value">{candidate.electionId}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidatesList;