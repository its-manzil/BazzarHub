import React, { useState } from 'react';
import './adminlogin.css';
import { Link, useNavigate } from 'react-router-dom';

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hardcoded credentials
  const adminEmail = 'admin@bazaarhub.com';
  const adminPassword = 'admin123';

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === adminEmail && password === adminPassword) {
      navigate('/AdminDashboard');
    } else {
      setErrorMsg('Invalid email or password.');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-sidebar">
          <img src="/images/BazaarHub.png" alt="BazaarHub Logo" className="admin-logo" />
          <h2>Welcome Back</h2>
          <p>Sign in to access your admin dashboard and manage the store efficiently.</p>
        </div>

        <div className="admin-login-form">
          <h2>Admin Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="admin-email">Email</label>
              <input
                type="email"
                id="admin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bazaarhub.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="admin-password">Password</label>
              <input
                type="password"
                id="admin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {errorMsg && <p className="error-message">{errorMsg}</p>}

            <button type="submit" className="admin-login-btn">Login</button>
            <p className="back-link">
              <Link to="/">← Back to Store</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
