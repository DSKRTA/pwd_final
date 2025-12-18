import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './SignupPage.css';

const SignupPage = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !username.trim() || !password.trim() || !confirmPassword.trim()) {
            setError('All fields are required');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setLoading(true);
            await signup(email, password, username);
            navigate('/');
        } catch (err) {
            console.error('Signup error:', err);
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-container pixel-panel">
                <h1 className="pixel-title signup-title">REGISTER</h1>
                <form onSubmit={handleSubmit} className="signup-form">
                    <div className="form-group">
                        <label className="pixel-label">EMAIL:</label>
                        <input
                            type="email"
                            className="pixel-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="pixel-label">USERNAME:</label>
                        <input
                            type="text"
                            className="pixel-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Choose username"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="pixel-label">PASSWORD:</label>
                        <input
                            type="password"
                            className="pixel-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="pixel-label">CONFIRM PASSWORD:</label>
                        <input
                            type="password"
                            className="pixel-input"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            required
                        />
                    </div>

                    {error && <div className="error-message pixel-text">{error}</div>}

                    <div className="form-actions">
                        <button type="submit" className="pixel-button" disabled={loading}>
                            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
                        </button>
                        <button
                            type="button"
                            className="pixel-button pixel-button-secondary"
                            onClick={() => navigate('/login')}
                            disabled={loading}
                        >
                            CANCEL
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
