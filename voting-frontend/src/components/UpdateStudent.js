import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DeleteStudent.css"; // create or reuse CSS from DeleteStudent/VerifiedStudents

const UpdateStudent = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    degree: "",
    faculty: "",
    program: "",
    major: "",
    yearOrSemester: "",
    symbolNumber: "",
    phoneNumber: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch verified students
  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/verified");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle selecting a student
  const selectStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name || "",
      email: student.email || "",
      degree: student.degree || "",
      faculty: student.faculty || "",
      program: student.program || "",
      major: student.major || "",
      yearOrSemester: student.yearOrSemester || "",
      symbolNumber: student.symbolNumber || "",
      phoneNumber: student.phoneNumber || "",
      address: student.address || "",
    });
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle update student
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      await axios.put(`http://localhost:5000/api/users/${selectedStudent._id}`, formData);
      alert("Student updated successfully!");
      fetchStudents();
      setSelectedStudent(null);
    } catch (err) {
      console.error("Error updating student:", err);
      alert("Failed to update student. Check console for details.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="update-student-container">
      <h2>Update Verified Students</h2>

      {students.length === 0 ? (
        <p>No verified students found.</p>
      ) : (
        <div className="students-grid">
          {students.map((student) => (
            <div
              key={student._id}
              className={`student-card ${selectedStudent?._id === student._id ? "selected" : ""}`}
              onClick={() => selectStudent(student)}
            >
              <div className="card-header">
                <img
                  src={student.photo ? `http://localhost:5000/${student.photo}` : "/default-avatar.png"}
                  alt={student.name}
                  className="profile-photo"
                />
                <div className="student-basic-info">
                  <h3>{student.name}</h3>
                  <p>Email: {student.email}</p>
                  <p>Roll: {student.symbolNumber}</p>
                </div>
              </div>
              <div className="card-body">
                <p>Degree: {student.degree}</p>
                <p>Faculty: {student.faculty}</p>
                <p>Program: {student.program}</p>
                <p>Major: {student.major || "N/A"}</p>
                <p>Year/Semester: {student.yearOrSemester}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStudent && (
        <div className="update-form-container">
          <h3>Update {selectedStudent.name}'s Information</h3>
          <form onSubmit={handleUpdate} className="update-student-form">
            <div className="form-group">
              <label>Name:</label>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Degree:</label>
              <input name="degree" value={formData.degree} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Faculty:</label>
              <input name="faculty" value={formData.faculty} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Program:</label>
              <input name="program" value={formData.program} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Major:</label>
              <input name="major" value={formData.major} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Year/Semester:</label>
              <input name="yearOrSemester" value={formData.yearOrSemester} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Roll Number:</label>
              <input name="symbolNumber" value={formData.symbolNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Address:</label>
              <input name="address" value={formData.address} onChange={handleChange} required />
            </div>
            <button type="submit" className="update-btn">Update Student</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdateStudent;