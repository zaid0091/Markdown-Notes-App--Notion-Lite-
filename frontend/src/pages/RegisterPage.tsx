import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

interface RegisterErrorResponse {
  username?: string[];
  email?: string[];
  password?: string[];
  non_field_errors?: string[];
  detail?: string;
}

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 1. Register User
      await register(username, email, password);
      // 2. Auto login
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      const responseData = err.response?.data as RegisterErrorResponse | undefined;
      
      let errMessage = 'Registration failed. Please check inputs.';
      if (responseData) {
        if (responseData.username) {
          errMessage = `Username error: ${responseData.username.join(' ')}`;
        } else if (responseData.email) {
          errMessage = `Email error: ${responseData.email.join(' ')}`;
        } else if (responseData.password) {
          errMessage = `Password error: ${responseData.password.join(' ')}`;
        } else if (responseData.non_field_errors) {
          errMessage = responseData.non_field_errors.join(' ');
        } else if (responseData.detail) {
          errMessage = responseData.detail;
        }
      }
      setError(errMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">Notion Lite</div>
          <p className="auth-subtitle">Create your personal markdown workspace</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="username-input">
              Username
            </label>
            <input
              id="username-input"
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="e.g. johndoe"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email-input">
              Email Address
            </label>
            <input
              id="email-input"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. user@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Min. 8 characters"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password-input">
              Confirm Password
            </label>
            <input
              id="confirm-password-input"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter password"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
