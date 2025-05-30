import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Register.css';

const facultyOptions = {
  Bachelor: {
    Science: {
      'B.Sc. CSIT': ['None'],
      'B.Sc. Microbiology': ['None'],
      'B.Sc. Environment Science': ['None'],
    },
    Management: {
      BBS: ['Finance', 'Marketing', 'Accounting'],
    },
    Humanities: {
      BSW: ['None'],
      BA: ['English', 'Sociology', 'Population'],
    },
    Education: {
      'B.Ed.': ['Math', 'English', 'Health', 'Nepali'],
    },
    Law: {
      LLB: ['None'],
    },
  },
  Master: {
    Management: {
      MBS: ['Finance', 'Marketing', 'Accounting'],
    },
    Humanities: {
      MA: ['English', 'Sociology'],
    },
    Education: {
      'M.Ed.': ['Math', 'English', 'Health'],
    },
  },
};

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    degree: '',
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
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
      ...(name === 'degree' && { faculty: '', program: '', major: '' }),
      ...(name === 'faculty' && { program: '', major: '' }),
      ...(name === 'program' && { major: '' }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.degree ||
      !formData.faculty ||
      !formData.program
    ) {
      setError('Please fill all required fields.');
      return;
    }
    if (!formData.photo || !formData.semesterBill || !formData.identityCard) {
      setError('Please upload all required files.');
      return;
    }

    const textData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      degree: formData.degree,
      faculty: formData.faculty,
      program: formData.program,
      major: formData.major || '',
    };

    const fileData = new FormData();
    fileData.append('photo', formData.photo);
    fileData.append('semesterBill', formData.semesterBill);
    fileData.append('identityCard', formData.identityCard);
    fileData.append('data', JSON.stringify(textData));

    console.log('Register payload:', {
      textData,
      files: {
        photo: formData.photo?.name,
        semesterBill: formData.semesterBill?.name,
        identityCard: formData.identityCard?.name,
      },
    });

    try {
      const response = await api.post('/api/auth/register', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Register response:', response.data);
      setSuccess('Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Register error:', err.response?.data || err);
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  const availableFaculties = formData.degree ? Object.keys(facultyOptions[formData.degree]) : [];
  const availablePrograms =
    formData.degree && formData.faculty
      ? Object.keys(facultyOptions[formData.degree][formData.faculty])
      : [];
  const availableMajors =
    formData.degree && formData.faculty && formData.program
      ? facultyOptions[formData.degree][formData.faculty][formData.program]
      : [];

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="input-container">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="dropdown-container">
          <label htmlFor="degree">Degree Level</label>
          <select
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            required
            className="modern-dropdown"
          >
            <option value="">Select Degree Level</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
          </select>
        </div>
        {availableFaculties.length > 0 && (
          <div className="dropdown-container dropdown-appear">
            <label htmlFor="faculty">Faculty</label>
            <select
              id="faculty"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              required
              className="modern-dropdown"
            >
              <option value="">Select Faculty</option>
              {availableFaculties.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>
          </div>
        )}
        {availablePrograms.length > 0 && (
          <div className="dropdown-container dropdown-appear">
            <label htmlFor="program">Program</label>
            <select
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              required
              className="modern-dropdown"
            >
              <option value="">Select Program</option>
              {availablePrograms.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </div>
        )}
        {availableMajors.length > 0 && availableMajors[0] !== 'None' && (
          <div className="dropdown-container dropdown-appear">
            <label htmlFor="major">Major</label>
            <select
              id="major"
              name="major"
              value={formData.major}
              onChange={handleChange}
              className="modern-dropdown"
            >
              <option value="">Select Major (optional)</option>
              {availableMajors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="input-container">
          <label htmlFor="photo">Upload Your Photo</label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="semesterBill">Upload Semester Bill</label>
          <input
            type="file"
            id="semesterBill"
            name="semesterBill"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-container">
          <label htmlFor="identityCard">Upload Identity Card</label>
          <input
            type="file"
            id="identityCard"
            name="identityCard"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default Register;