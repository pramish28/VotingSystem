//test hello

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // for navigation
import api from '../api';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    
    photo: null,
    semesterBill: null,
    identityCard: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // for redirection

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      await api.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Registration submitted. Redirecting to login page in 5 seconds...');
      setError('');
      setFormData({ name: '', email: '', password: '', photo: null, semesterBill: null, identityCard: null });

      setTimeout(() => {
        navigate('/login');  
      }, 5000);
    } catch (err) {
      console.error("Registration error:", err); //for debugging
      setSuccess('');
      setError('Registration failed. Try again.');
    }
  };

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>

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

 {/* Photo Upload */}
 <div className="file-input-wrapper">
          <label className="custom-file-upload" htmlFor="photo">
            Upload Your Photo (Passport Size)
          </label>
          <input
            id="photo"
            type="file"
            name="photo"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
            required
          />
          <span className="file-name">{formData.photo ? formData.photo.name : "No file chosen"}</span>
        </div>

        {/* Semester Bill Upload */}
        <div className="file-input-wrapper">
          <label className="custom-file-upload" htmlFor="semesterBill">
            Upload Semester Bill Receipt
          </label>
          <input
            id="semesterBill"
            type="file"
            name="semesterBill"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
            required
          />
          <span className="file-name">{formData.semesterBill ? formData.semesterBill.name : "No file chosen"}</span>
        </div>

        {/* Identity Card Upload */}
        <div className="file-input-wrapper">
          <label className="custom-file-upload" htmlFor="identityCard">
            Upload College Identity Card
          </label>
          <input
            id="identityCard"
            type="file"
            name="identityCard"
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
            required
          />
          <span className="file-name">{formData.identityCard ? formData.identityCard.name : "No file chosen"}</span>
        </div>

        <button type="submit">Submit</button>
      </form>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default Register;
