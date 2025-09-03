// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import "./DeleteStudent.css"; // create or reuse CSS from DeleteStudent/VerifiedStudents

// const UpdateStudent = () => {
//   const [students, setStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     degree: "",
//     faculty: "",
//     program: "",
//     major: "",
//     yearOrSemester: "",
//     symbolNumber: "",
//     phoneNumber: "",
//     address: "",
//   });
//   const [loading, setLoading] = useState(true);

//   // Fetch verified students
//   const fetchStudents = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/users/verified");
//       setStudents(res.data);
//     } catch (err) {
//       console.error("Error fetching students:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStudents();
//   }, []);

//   // Handle selecting a student
//   const selectStudent = (student) => {
//     setSelectedStudent(student);
//     setFormData({
//       name: student.name || "",
//       email: student.email || "",
//       degree: student.degree || "",
//       faculty: student.faculty || "",
//       program: student.program || "",
//       major: student.major || "",
//       yearOrSemester: student.yearOrSemester || "",
//       symbolNumber: student.symbolNumber || "",
//       phoneNumber: student.phoneNumber || "",
//       address: student.address || "",
//     });
//   };

//   // Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // Handle update student
//   const handleUpdate = async (e) => {
//     e.preventDefault();
//     if (!selectedStudent) return;

//     try {
//       await axios.put(`http://localhost:5000/api/users/${selectedStudent._id}`, formData);
//       alert("Student updated successfully!");
//       fetchStudents();
//       setSelectedStudent(null);
//     } catch (err) {
//       console.error("Error updating student:", err);
//       alert("Failed to update student. Check console for details.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading students...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="update-student-container">
//       <h2>Update Verified Students</h2>

//       {students.length === 0 ? (
//         <p>No verified students found.</p>
//       ) : (
//         <div className="students-grid">
//           {students.map((student) => (
//             <div
//               key={student._id}
//               className={`student-card ${selectedStudent?._id === student._id ? "selected" : ""}`}
//               onClick={() => selectStudent(student)}
//             >
//               <div className="card-header">
//                 <img
//                   src={student.photo ? `http://localhost:5000/${student.photo}` : "/default-avatar.png"}
//                   alt={student.name}
//                   className="profile-photo"
//                 />
//                 <div className="student-basic-info">
//                   <h3>{student.name}</h3>
//                   <p>Email: {student.email}</p>
//                   <p>Roll: {student.symbolNumber}</p>
//                 </div>
//               </div>
//               <div className="card-body">
//                 <p>Degree: {student.degree}</p>
//                 <p>Faculty: {student.faculty}</p>
//                 <p>Program: {student.program}</p>
//                 <p>Major: {student.major || "N/A"}</p>
//                 <p>Year/Semester: {student.yearOrSemester}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedStudent && (
//         <div className="update-form-container">
//           <h3>Update {selectedStudent.name}'s Information</h3>
//           <form onSubmit={handleUpdate} className="update-student-form">
//             <div className="form-group">
//               <label>Name:</label>
//               <input name="name" value={formData.name} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <label>Email:</label>
//               <input type="email" name="email" value={formData.email} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <label>Degree:</label>
//               <input name="degree" value={formData.degree} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <label>Faculty:</label>
//               <input name="faculty" value={formData.faculty} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <label>Program:</label>
//               <input name="program" value={formData.program} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <label>Major:</label>
//               <input name="major" value={formData.major} onChange={handleChange} />
//             </div>
//             <div className="form-group">
//               <label>Year/Semester:</label>
//               <input name="yearOrSemester" value={formData.yearOrSemester} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <label>Roll Number:</label>
//               <input name="symbolNumber" value={formData.symbolNumber} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <label>Phone:</label>
//               <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
//             </div>
//             <div className="form-group">
//               <label>Address:</label>
//               <input name="address" value={formData.address} onChange={handleChange} required />
//             </div>
//             <button type="submit" className="update-btn">Update Student</button>
//           </form>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UpdateStudent;

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

  return (
    <div className="us-page">
      <header className="us-header">
        <h2>Update Verified Students</h2>
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
              <button className="us-search-clear" onClick={() => setSearch("")} title="Clear search">×</button>
            )}
          </div>
          <button className="us-btn us-refresh" onClick={fetchStudents}>Refresh</button>
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
            Showing <strong>{filtered.length}</strong> of <strong>{students.length}</strong> verified students
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
                    <h3 className="us-name" title={s.name}>{s.name}</h3>
                    <div className="us-line">
                      <span className="us-label">Email:</span>
                      <span className="us-value" title={s.email}>{s.email}</span>
                    </div>
                    <div className="us-line">
                      <span className="us-label">Roll:</span>
                      <span className="us-value">{s.symbolNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="us-card-body">
                  <div className="us-kv"><span>Degree:</span><strong title={s.degree}>{s.degree}</strong></div>
                  <div className="us-kv"><span>Faculty:</span><strong title={s.faculty}>{s.faculty}</strong></div>
                  <div className="us-kv"><span>Program:</span><strong title={s.program}>{s.program}</strong></div>
                  <div className="us-kv"><span>Major:</span><strong title={s.major || "N/A"}>{s.major || "N/A"}</strong></div>
                  <div className="us-kv"><span>Year/Sem:</span><strong>{s.yearOrSemester}</strong></div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

