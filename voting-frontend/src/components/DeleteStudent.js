
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DeleteStudent.css";

const DeleteStudent = () => {
  const [students, setStudents] = useState([]);

  // Fetch verified students
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/verified");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // Delete student by ID
  const deleteStudent = async (studentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/verified/${studentId}`);
      setStudents(students.filter((student) => student._id !== studentId));
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="delete-student-container">
      <h2>Delete Verified Students</h2>

      {students.length === 0 ? (
        <div className="no-students">
          <div className="no-students-icon">🔍</div>
          <h3>No Verified Students</h3>
          <p>No verified records to show right now.</p>
        </div>
      ) : (
        <div className="students-grid">
          {students.map((student) => (
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
                    <h3 className="student-name">{student.name || "Name not provided"}</h3>
                    <p className="student-id">Roll: {student.student_id || "N/A"}</p>
                    <p className="student-email">{student.email || "Email not provided"}</p>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="student-details">
                  <div className="detail-row">
                    <span className="detail-label">Degree Level:</span>
                    <span className="detail-value">{student.degree || "Not specified"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Faculty:</span>
                    <span className="detail-value">{student.faculty || "Not specified"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Program:</span>
                    <span className="detail-value">{student.program || "Not specified"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Major:</span>
                    <span className="detail-value">{student.major || "Not specified"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{student.phoneNumber || "Not provided"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Address:</span>
                    <span className="detail-value">{student.address || "Not specified"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Registration Number:</span>
                    <span className="detail-value">{student.symbolNumber || "Not specified"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Verified On:</span>
                    <span className="detail-value">
                      {student.verifiedAt
                        ? new Date(student.verifiedAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Delete button below the ID card */}
                <div className="delete-btn-container">
                  <button
                    className="delete-btn"
                    onClick={() => {
                         if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
                        deleteStudent(student._id)}}}
                  >
                    Delete Student
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

export default DeleteStudent;