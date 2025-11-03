import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { useAuth } from '../AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student', // default role set to 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiReady, setApiReady] = useState(true); // State to track API readiness (kept)
  const navigate = useNavigate();
  const { login } = useAuth(); // <- use AuthContext login so user is populated before navigate

  // Check if API is ready before allowing login (kept)
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        // Make a simple health check or just set ready after a small delay
        await new Promise((resolve) => setTimeout(resolve, 100));
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

    console.log('===FORM SUBMIT START===');
    console.log('Form data at submit:', formData);
    setError('');
    setLoading(true);

    try {
      console.log('Making API call via AuthContext.login()...');
      // AuthContext.login handles token storage + sets user in context
      const user = await login(formData.email, formData.password);

      console.log('Selected role:', formData.role);
      console.log('User role from backend:', user.role);

      // Check if selected role matches actual user role from backend
      if (formData.role !== user.role) {
        setError(
          `You selected role "${formData.role}" but your registered role is "${user.role}". Please select the correct role.`
        );
        setLoading(false);
        return;
      }

      console.log('Login successful, redirecting...');
      // Tiny delay is optional; helps ensure storage/ctx settled
      await new Promise((resolve) => setTimeout(resolve, 100));
      const route = user.role === 'admin' ? '/admin-dashboard' : '/student-dashboard';
      console.log('Navigating to the appropriate dashboard...', route);
      navigate(route);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Login failed. Please try again.';
      setError(msg);
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
            disabled={loading || !apiReady}
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
            disabled={loading || !apiReady}
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
            disabled={loading || !apiReady}
          />
        </div>

        <button type="submit" disabled={loading || !apiReady}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      <p>
        Don&apos;t have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}

export default Login;