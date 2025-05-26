import React, { useState } from 'react';
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
      setSuccess('Registration submitted. Await admin verification.');
      setFormData({ name: '', email: '', password: '', photo: null, semesterBill: null, identityCard: null });
    } catch (err) {
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
        <input
          type="file"
          name="photo"
          accept=".jpg,.png"
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="semesterBill"
          accept=".jpg,.png"
          onChange={handleChange}
          required
        />
        <input
          type="file"
          name="identityCard"
          accept=".jpg,.png"
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default Register;