import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ApproveStudents.css";

const ApproveStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const navigate = useNavigate();

  const fetchPendingStudents = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/users/pending-students"
      );
      const data = await res.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching pending students:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      const response = await fetch(
        `http://localhost:5000/api/students/approve-student/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isVerified: true }),
        }
      );

      if (response.ok) {
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student._id !== id)
        );
      } else {
        console.error("Failed to approve student");
      }
    } catch (err) {
      console.error("Error approving student:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setProcessingId(id);
    try {
      const response = await fetch(
        `http://localhost:5000/api/students/reject-student/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setStudents((prevStudents) =>
          prevStudents.filter((student) => student._id !== id)
        );
      } else {
        console.error("Failed to reject student");
      }
    } catch (err) {
      console.error("Error rejecting student:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewDocument = (documentUrl, documentType) => {
    if (documentUrl) {
      window.open(documentUrl, "_blank");
    } else {
      alert(`${documentType} not available`);
    }
  };

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading pending students...</p>
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
        <h1>Pending Student Approvals</h1>
        <div className="students-count">
          {students.length} student{students.length !== 1 ? "s" : ""} pending
          approval
        </div>
      </div>

      {students.length === 0 ? (
        <div className="no-students">
          <div className="no-students-icon">📋</div>
          <h3>No Pending Approvals</h3>
          <p>
            All students have been processed. Check back later for new
            registrations.
          </p>
        </div>
      ) : (
        <div className="students-grid">
          {students.map((student) => (
            <div key={student._id} className="student-card">
              <div className="card-header">
                <div className="profile-section">
                  <div className="profile-photo-container">
                    <img
                      src={student.photoUrl || "/default-avatar.png"}
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
                      {student.phone || "Not provided"}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Registration Date:</span>
                    <span className="detail-value">
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>

                <div className="documents-section">
                  <h4>Documents</h4>
                  <div className="document-buttons">
                    <button
                      className="doc-btn semester-bill-btn"
                      onClick={() =>
                        handleViewDocument(
                          student.semesterBillUrl,
                          "Semester Bill"
                        )
                      }
                    >
                      📄 Semester Bill
                    </button>
                    <button
                      className="doc-btn identity-card-btn"
                      onClick={() =>
                        handleViewDocument(
                          student.identityCardUrl,
                          "Identity Card"
                        )
                      }
                    >
                      🆔 Identity Card
                    </button>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="action-buttons">
                  <button
                    className={`approve-btn ${
                      processingId === student._id ? "processing" : ""
                    }`}
                    onClick={() => handleApprove(student._id)}
                    disabled={processingId === student._id}
                  >
                    {processingId === student._id
                      ? "⏳ Processing..."
                      : "✅ Approve"}
                  </button>
                  <button
                    className={`reject-btn ${
                      processingId === student._id ? "processing" : ""
                    }`}
                    onClick={() => handleReject(student._id)}
                    disabled={processingId === student._id}
                  >
                    {processingId === student._id
                      ? "⏳ Processing..."
                      : "❌ Reject"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApproveStudents;
