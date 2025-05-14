import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img src={logo} alt="Logo" className="h-10 mr-4" />
          <Link to="/" className="text-white text-lg font-bold">Online Voting</Link>
        </div>
        <div>
          {token ? (
            <>
              {role === 'admin' ? (
                <>
                  <Link to="/admin-dashboard" className="text-white mx-2">Admin Dashboard</Link>
                  <Link to="/pending-users" className="text-white mx-2">Pending Users</Link>
                </>
              ) : (
                <>
                  <Link to="/voting" className="text-white mx-2">Vote</Link>
                  <Link to="/results" className="text-white mx-2">Results</Link>
                </>
              )}
              <button onClick={handleLogout} className="text-white mx-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/register" className="text-white mx-2">Register</Link>
              <Link to="/login" className="text-white mx-2">Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;