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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    if (login(username, password)) {
      navigate('/');
    } else {
      setError('Login failed. Please try again.');
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
        </form>
      </div>
    </div>
  );
};

export default LoginPage;


