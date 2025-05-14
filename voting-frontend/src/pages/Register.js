import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceCapture from '../components/FaceCapture';
import api from '../api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    photo: null,
    idDocument: null,
    admissionBill: null,
  });
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!faceDescriptor) {
      setError('Please capture your face');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('photo', formData.photo);
    data.append('idDocument', formData.idDocument);
    data.append('admissionBill', formData.admissionBill);
    data.append('faceDescriptor', JSON.stringify(faceDescriptor));

    try {
      await api.post('/auth/register', data);
      alert('Registration submitted. Await admin approval.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl mb-4">Register</h2>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Name"
          className="w-full p-2 mb-2 border"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          className="w-full p-2 mb-2 border"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Password"
          className="w-full p-2 mb-2 border"
          required
        />
        <label className="block mb-2">
          Photo:
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </label>
        <label className="block mb-2">
          ID Document:
          <input
            type="file"
            name="idDocument"
            accept="image/*,application/pdf"
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </label>
        <label className="block mb-2">
          Admission Bill:
          <input
            type="file"
            name="admissionBill"
            accept="image/*,application/pdf"
            onChange={handleInputChange}
            className="w-full"
            required
          />
        </label>
        <FaceCapture onCapture={setFaceDescriptor} />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">
          Register
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default Register;