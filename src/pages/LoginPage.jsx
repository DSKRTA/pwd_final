import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      await login(username, password);
      // If successful (no error thrown), navigate
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container pixel-panel">
        <h1 className="pixel-title login-title">LOGIN</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="pixel-label">USERNAME:</label>
            <input
              type="text"
              className="pixel-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>
          <div className="form-group">
            <label className="pixel-label">PASSWORD:</label>
            <input
              type="password"
              className="pixel-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          {error && <div className="error-message pixel-text">{error}</div>}
          <div className="form-actions">
            <button type="submit" className="pixel-button">
              LOGIN
            </button>
            <button
              type="button"
              className="pixel-button pixel-button-secondary"
              onClick={handleBack}
            >
              BACK
            </button>
          </div>
          <div className="login-note">
            New here? <button type="button" className="pixel-link" onClick={() => navigate('/register')}>Create Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;


