import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VerifiedUsers.css"; // you can reuse or adjust the CSS from ApproveStudents.css
import api from "../api";

const VerifiedStudents = () => {
  const [verifiedStudents, setVerifiedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchVerifiedStudents = async () => {
    try {
      const res = await api.get("/api/users/verified");
      setVerifiedStudents(res.data);
    } catch (error) {
      console.error("Error fetching verified students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifiedStudents();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading verified students...</p>
      </div>
    );
  }

  return (
    <div className="approve-students-container">
      <div className="header-section">
        <button
          className="back-btn"
          onClick={() => navigate("/admin-dashboard")}
        >
          ← Back to Dashboard
        </button>
        <h1>Verified Students</h1>
        <div className="students-count">
          {verifiedStudents.length} verified student
          {verifiedStudents.length !== 1 ? "s" : ""}
        </div>
      </div>

      {verifiedStudents.length === 0 ? (
        <div className="no-students">
          <div className="no-students-icon">🔍</div>
          <h3>No Verified Students</h3>
          <p>No verified records to show right now.</p>
        </div>
      ) : (
        <div className="students-grid">
          {verifiedStudents.map((student) => (
            <div key={student._id} className="student-card">
              <div className="card-header">
                <div className="profile-section">
                  <div className="profile-photo-container">
                    <img
                      src={
                        student.photo
                          ? `http://localhost:5000/${student.photo}`
                          : "/default-avatar.png"
                      }
                      alt={`${student.name || "Student"}'s profile`}
                      className="profile-photo"
                    />
                  </div>
                  <div className="student-basic-info">
                    <h3 className="student-name">
                      {student.name || "Name not provided"}
                    </h3>
                    <p className="student-id">
                      Roll: {student.student_id || "N/A"}
                    </p>
                    <p className="student-email">
                      {student.email || "Email not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="student-details">
                  <div className="detail-row">
                    <span className="detail-label">Degree Level:</span>
                    <span className="detail-value">
                      {student.degree || "Not specified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Faculty:</span>
                    <span className="detail-value">
                      {student.faculty || "Not specified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Program:</span>
                    <span className="detail-value">
                      {student.program || "Not specified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Major:</span>
                    <span className="detail-value">
                      {student.major || "Not specified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">
                      {student.phoneNumber || "Not provided"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">
                      {student.address || "Not specified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Registration Number:</span>
                    <span className="detail-value">
                      {student.symbolNumber || "Not specified"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Verified On:</span>
                    <span className="detail-value">
                      {student.verifiedAt
                        ? new Date(student.verifiedAt).toLocaleString('en-US',{
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',  
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })
                        : "Unknown"}
                    </span>
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

export default VerifiedStudents;
