// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Register.css';

const faculties = {
  Science: {
    programs: {
      'B.Sc. CSIT': ['None'],
      'B.Sc. Microbiology': ['None'],
      'B.Sc. Environment Science': ['None'],
    },
  },
  Management: {
    programs: {
      BBS: ['Finance', 'Marketing', 'Accounting'],
    },
  },
  Humanities: {
    programs: {
      BSW: ['None'],
      BA: ['English', 'Sociology', 'Population'],
    },
  },
  Education: {
    programs: {
      'B.Ed.': ['Math', 'English', 'Health', 'Nepali'],
    },
  },
  Law: {
    programs: {
      LLB: ['None'],
    },
  },
};

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    faculty: '',
    program: '',
    major: '',
    photo: null,
    semesterBill: null,
    identityCard: null,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });

    // Reset program and major if faculty changes
    if (name === 'faculty') {
      setFormData((prev) => ({
        ...prev,
        program: '',
        major: '',
      }));
    }

    // Reset major if program changes
    if (name === 'program') {
      setFormData((prev) => ({
        ...prev,
        major: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate required fields before submitting
    if (!formData.name || !formData.email || !formData.password || !formData.faculty) {
      setError('Please fill all required fields');
      return;
    }
    if (!formData.photo || !formData.semesterBill || !formData.identityCard) {
      setError('Please upload all required files');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        data.append(key, formData[key]);
      }
    });

    try {
      await api.post('/auth/register', data);
      setSuccess('Registration submitted. Redirecting to login page in 5 seconds...');
      setError('');
      setFormData({
        name: '',
        email: '',
        password: '',
        faculty: '',
        program: '',
        major: '',
        photo: null,
        semesterBill: null,
        identityCard: null,
      });

      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      console.error('Registration error:', err.response?.data || err);
      setSuccess('');
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
  };

  const selectedPrograms = formData.faculty ? Object.keys(faculties[formData.faculty].programs) : [];
  const selectedMajors =
formData.faculty && formData.program ? faculties[formData.faculty].programs[formData.program] : [];

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
      
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
{/* Faculty Dropdown */}
<div className="dropdown-container">
  {/* <label className="dropdown-label">Faculty</label> */}
  <div style={{position: 'relative'}}>
    <select 
      name="faculty" 
      value={formData.faculty} 
      onChange={handleChange} 
      required
      className="modern-dropdown faculty"
    >
      <option value="">Select Faculty</option>
      {Object.keys(faculties).map((faculty) => (
        <option key={faculty} value={faculty}>
          {faculty}
        </option>
      ))}
    </select>
    <div className="dropdown-arrow"></div>
  </div>
</div>

{/* Program Dropdown */}
{selectedPrograms.length > 0 && (
  <div className="dropdown-container dropdown-appear">
    {/* <label className="dropdown-label">Program</label> */}
    <div style={{position: 'relative'}}>
      <select 
        name="program" 
        value={formData.program} 
        onChange={handleChange} 
        required
        className="modern-dropdown program"
      >
        <option value="">Select Program</option>
        {selectedPrograms.map((program) => (
          <option key={program} value={program}>
            {program}
          </option>
        ))}
      </select>
      <div className="dropdown-arrow"></div>
    </div>
  </div>
)}

{/* Major Dropdown */}
{selectedMajors.length > 0 && selectedMajors[0] !== 'None' && (
  <div className="dropdown-container dropdown-appear">
    {/* <label className="dropdown-label">Major</label> */}
    <div style={{position: 'relative'}}>
      <select 
        name="major" 
        value={formData.major} 
        onChange={handleChange} 
        required
        className="modern-dropdown major"
      >
        <option value="">Select Major</option>
        {selectedMajors.map((major) => (
          <option key={major} value={major}>
            {major}
          </option>
        ))}
      </select>
      <div className="dropdown-arrow"></div>
    </div>
  </div>
)}

        {/* Photo Upload */}
        <div className="file-input-wrapper">
          <label className="custom-file-upload" htmlFor="photo">
            Upload Your Photo
          </label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
            required
          />
          <span className="file-name">{formData.photo ? formData.photo.name : 'No file chosen'}</span>
        </div>

        {/* Semester Bill Upload */}
        <div className="file-input-wrapper">
          <label className="custom-file-upload" htmlFor="semesterBill">
            Upload Semester Bill
          </label>
          <input
            type="file"
            id="semesterBill"
            name="semesterBill"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
            required
          />
          <span className="file-name">
            {formData.semesterBill ? formData.semesterBill.name : 'No file chosen'}
          </span>
        </div>

        {/* Identity Card Upload */}
        <div className="file-input-wrapper">
          <label className="custom-file-upload" htmlFor="identityCard">
            Upload Identity Card
          </label>
          <input
            type="file"
            id="identityCard"
            name="identityCard"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
            required
          />
          <span className="file-name">
            {formData.identityCard ? formData.identityCard.name : 'No file chosen'}
          </span>
        </div>

        <button type="submit">Submit</button>
      </form>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default Register;