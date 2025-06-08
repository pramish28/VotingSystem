import React, { useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student', //default role set to 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiReady, setApiReady] = useState(true); // State to track API readiness
  const navigate = useNavigate();

  //check if API is ready before allowing login
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        // Make a simple health check or just set ready after a small delay
        await new Promise(resolve => setTimeout(resolve, 100));
        setApiReady(true);
      } catch (error) {
        console.error('API connection check failed:', error);
        setApiReady(true); // Still allow attempts
      }
    };
    
    checkApiConnection();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("===FORM SUBMIT START==="); //debugging line
    console.log("Form data at submit:", formData); // Debugging line
    setError('');
    setLoading(true);

    const payload = {
      email: formData.email,
      password: formData.password,
    };

    console.log("Payload being sent:", payload); // Debugging line

    try {
      console.log("Making API call..."); // Debugging line
     
      const response = await api.post('/api/auth/login', payload);
      console.log('API Response received:', response.data); // Debugging line
      const { token, user } = response.data;
      
          console.log('Selected role:', formData.role);
    console.log('User role from backend:', user.role);

      // Check if selected role matches actual user role from backend
      if (formData.role !== user.role) {
        setError(`You selected role "${formData.role}" but your registered role is "${user.role}". Please select the correct role.`);
        setLoading(false);
        return;
      }
        console.log('Login successful, redirecting...');

      // Store token and redirect based on role
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log("Token stored, waiting before navigation...");

      //Adding a small delay to ensure token is stored before navigation
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log("Navigating to the appropriate dashboard...");
      const route = user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard';
      navigate(route);

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
      console.log('=== FORM SUBMIT END ===');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>

        <div className="input-container">
          <label htmlFor="role">Role</label>
         
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="input-container">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="input-container">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

      </form>

      {error && <p className="error">{error}</p>}

      <p>
        Don't have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}

export default Login;
