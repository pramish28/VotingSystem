import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./EditStudent.css";

const API = "http://localhost:5000";

export default function EditStudent() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const studentFromState = location.state?.student || null;

  const [loading, setLoading] = useState(!studentFromState);
  const [student, setStudent] = useState(studentFromState);
  const [formData, setFormData] = useState({
    name: studentFromState?.name || "",
    email: studentFromState?.email || "",
    degree: studentFromState?.degree || "",
    faculty: studentFromState?.faculty || "",
    program: studentFromState?.program || "",
    major: studentFromState?.major || "",
    yearOrSemester: studentFromState?.yearOrSemester || "",
    symbolNumber: studentFromState?.symbolNumber || "",
    phoneNumber: studentFromState?.phoneNumber || "",
    address: studentFromState?.address || "",
  });

  const firstInputRef = useRef(null);

  // Fallback if user navigates directly (no state):
  useEffect(() => {
    const load = async () => {
      if (studentFromState) {
        requestAnimationFrame(() => firstInputRef.current?.focus());
        return;
      }
      try {
        // Some backends don't have GET /api/users/:id. We fall back to /verified and find locally.
        const res = await axios.get(`${API}/api/users/verified`);
        const s = (Array.isArray(res.data) ? res.data : []).find((x) => x._id === id);
        if (!s) throw new Error("Student not found in verified list");
        setStudent(s);
        setFormData({
          name: s.name || "",
          email: s.email || "",
          degree: s.degree || "",
          faculty: s.faculty || "",
          program: s.program || "",
          major: s.major || "",
          yearOrSemester: s.yearOrSemester || "",
          symbolNumber: s.symbolNumber || "",
          phoneNumber: s.phoneNumber || "",
          address: s.address || "",
        });
      } catch (e) {
        console.error("Could not load the student data:", e);
        alert("Could not load the student data. Open from the Update list, or ensure the user is verified.");
        navigate("/update-student", { replace: true });
        return;
      } finally {
        setLoading(false);
        requestAnimationFrame(() => firstInputRef.current?.focus());
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/api/users/${id}`, formData);
      alert("Student updated successfully!");
      // Go back to list (same tab)
      navigate("/update-student", { replace: true });
    } catch (err) {
      console.error("Error updating student:", err);
      alert("Failed to update student. Check console for details.");
    }
  };

  if (loading) {
    return (
      <div className="es-page">
        <div className="es-loading">
          <div className="es-spinner" />
          <p>Loading student…</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="es-page">
        <p>Student not found.</p>
        <button className="es-btn es-light" onClick={() => navigate("/update-student")}>
          ← Back to list
        </button>
      </div>
    );
  }

  return (
    <div className="es-page">
      <header className="es-header">
        <button className="es-btn es-light" onClick={() => navigate("/update-student")}>← Back</button>
        <h2>Edit Student</h2>
        <div />
      </header>

      <div className="es-card">
        <div className="es-side">
          <img
            src={student.photo ? `${API}/${student.photo}` : "/default-avatar.png"}
            alt={student.name}
            className="es-photo"
          />
          <div className="es-meta">
            <div><strong>Roll:</strong> {student.symbolNumber}</div>
            <div><strong>Faculty:</strong> {student.faculty}</div>
            <div><strong>Program:</strong> {student.program}</div>
          </div>
        </div>

        <form className="es-form" onSubmit={handleUpdate}>
          <div className="es-row">
            <label>Name</label>
            <input ref={firstInputRef} name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="es-row">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="es-row">
            <label>Degree</label>
            <input name="degree" value={formData.degree} onChange={handleChange} required />
          </div>
          <div className="es-row">
            <label>Faculty</label>
            <input name="faculty" value={formData.faculty} onChange={handleChange} required />
          </div>
          <div className="es-row">
            <label>Program</label>
            <input name="program" value={formData.program} onChange={handleChange} required />
          </div>
          <div className="es-row">
            <label>Major</label>
            <input name="major" value={formData.major} onChange={handleChange} />
          </div>
          <div className="es-row">
            <label>Year/Semester</label>
            <input name="yearOrSemester" value={formData.yearOrSemester} onChange={handleChange} required />
          </div>
          <div className="es-row">
            <label>Roll Number</label>
            <input name="symbolNumber" value={formData.symbolNumber} onChange={handleChange} required />
          </div>
          <div className="es-row">
            <label>Phone</label>
            <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
          </div>
          <div className="es-row">
            <label>Address</label>
            <input name="address" value={formData.address} onChange={handleChange} required />
          </div>

          <div className="es-actions">
            <button type="submit" className="es-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
