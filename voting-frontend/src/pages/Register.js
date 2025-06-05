import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Register.css';

const facultyOptions = {
  Bachelor: {
    Science: {
      'B.Sc. CSIT': ['None'],
      'B.Sc. Environment Science': ['None'],
      BIT: ['None'],
      'B.Sc. General': ['Physics', 'Chemistry', 'Botany'],
    },
    Management: {
      BBS: ['Finance', 'Marketing', 'Accounting'],
      BBA: ['None'],
      BBM: ['None'],
      BCA: ['None'],
    },
    Humanities: {
      BASW: ['None'],
      BA: ['English', 'Nepali', 'Economics', 'Sociology', 'Nepal Bhasa'],
    }
  },
  Master: {
    Science: {
      'M.Sc. Physics': ['None'],
      'M.Sc. Environment Science': ['None'],
      MIT: ['None'],
    },
    Management: {
      MBS: ['Finance', 'Marketing', 'Accounting'],
      MBA: ['None'],
      MCA: ['None'],
    },
    Humanities: {
      MA: ['English', 'Nepali', 'Economics', 'Sociology', 'Rural Development'],
    }
  }
};

const yearSemesterOptions = {
  'B.Sc. CSIT': 'Semester',
  'B.Sc. Environment Science': 'Year',
  'B.Sc. General': 'Year',
  BIT: 'Semester',
  BBS: 'Year',
  BBA: 'Semester',
  BBM: 'Semester',
  BCA: 'Semester',
  BASW: 'Year',
  BA: 'Year',
  'M.Sc. Physics': 'Semester',
  'M.Sc. Environment Science': 'Semester',
  MIT: 'Semester',
  MBS: 'Year',
  MBA: 'Semester',
  MCA: 'Semester',
  MA: 'Year',
};

const getLevelOptions = (program) => {
  const system = yearSemesterOptions[program];
  if (!system) return [];

  const isBachelor = Object.values(facultyOptions.Bachelor).some(fac =>
    Object.keys(fac).includes(program)
  );

  if (system === 'Semester') {
    return isBachelor
      ? [
          '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
          '5th Semester', '6th Semester', '7th Semester', '8th Semester'
        ]
      : [
          '1st Semester', '2nd Semester', '3rd Semester', '4th Semester'
        ];
  } else if (system === 'Year') {
    return isBachelor
      ? ['1st Year', '2nd Year', '3rd Year', '4th Year']
      : ['1st Year', '2nd Year'];
  } else {
    return [];
  }
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
    yearOrSemester: '',
    symbolNumber: '',
    phoneNumber: '',
    address: '',
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
      ...(name === 'degree' && { faculty: '', program: '', major: '', yearOrSemester: '' }),
      ...(name === 'faculty' && { program: '', major: '', yearOrSemester: '' }),
      ...(name === 'program' && { major: '', yearOrSemester: '' }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const {
      name, email, password, degree,
      faculty, program, major,
      yearOrSemester, symbolNumber,
      photo, semesterBill, identityCard, phoneNumber, address
    } = formData;

    if (!name || !email || !password || !degree || !faculty || !program || !yearOrSemester || !symbolNumber || !phoneNumber || !address) {
      setError('Please fill all required fields.');
      return;
    }

    if (!photo || !semesterBill || !identityCard) {
      setError('Please upload all required files.');
      return;
    }

    const textData = {
      name, email, password, degree,
      faculty, program, major: major || '',
      yearOrSemester,
      symbolNumber,
      phoneNumber,
      address,
    };

    const fileData = new FormData();
    fileData.append('photo', photo);
    fileData.append('semesterBill', semesterBill);
    fileData.append('identityCard', identityCard);
    fileData.append('data', JSON.stringify(textData));

    try {
      const response = await api.post('/api/auth/register', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
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

  const yearOrSemesterType = yearSemesterOptions[formData.program];
  const levelOptions = getLevelOptions(formData.program);

  return (
    <div className="register-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data" autoComplete='off'>
        <div className="input-container">
          <label htmlFor="name">Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="input-container">
          <label htmlFor="email">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className="input-container">
          <label htmlFor="phoneNumber">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            placeholder="+977 98XXXXXXXX"
            pattern="^(\+977)?9\d{9}$"
          />
        </div>

        <div className="input-container">
          <label htmlFor="password">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </div>

        
        <div className="input-container">
          <label htmlFor="address">Address</label>
          <input type="text" name="address" placeholder='(Note:Please, Provide full Address)' 
          value={formData.address} onChange={handleChange} required />
        </div>

        <div className="dropdown-container">
          <label>Degree Level</label>
          <select name="degree" value={formData.degree} onChange={handleChange} required>
            <option value="">Select Degree</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
          </select>
        </div>

        {availableFaculties.length > 0 && (
          <div className="dropdown-container">
            <label>Faculty</label>
            <select name="faculty" value={formData.faculty} onChange={handleChange} required>
              <option value="">Select Faculty</option>
              {availableFaculties.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        )}

        {availablePrograms.length > 0 && (
          <div className="dropdown-container">
            <label>Program</label>
            <select name="program" value={formData.program} onChange={handleChange} required>
              <option value="">Select Program</option>
              {availablePrograms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}

        {availableMajors.length > 0 && availableMajors[0] !== 'None' && (
          <div className="dropdown-container">
            <label>Major</label>
            <select name="major" value={formData.major} onChange={handleChange}>
              <option value="">Select Major (optional)</option>
              {availableMajors.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        )}

        {levelOptions.length > 0 && (
          <div className="dropdown-container">
            <label>{yearOrSemesterType === 'Semester' ? 'Semester' : 'Year'}</label>
            <select name="yearOrSemester" value={formData.yearOrSemester} onChange={handleChange} required>
              <option value="">Select {yearOrSemesterType}</option>
              {levelOptions.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        )}

        <div className="input-container">
          <label>Symbol/Registration Number</label>
          <input type="text" name="symbolNumber" value={formData.symbolNumber} onChange={handleChange} required />
        </div>

        <div className="input-container">
          <label>Upload Photo</label>
          <input type="file" name="photo" accept=".jpg,.jpeg,.png" onChange={handleChange} required />
        </div>

        <div className="input-container">
          <label>Upload Semester Bill</label>
          <input type="file" name="semesterBill" accept=".jpg,.jpeg,.png" onChange={handleChange} required />
        </div>

        <div className="input-container">
          <label>Upload Identity Card</label>
          <input type="file" name="identityCard" accept=".jpg,.jpeg,.png" onChange={handleChange} required />
        </div>

        <button type="submit">Submit</button>
      </form>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </div>
  );
}

export default Register;