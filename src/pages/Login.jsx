import { useState } from 'react';
import { login } from '../utils/auth';
import './Login.css'; // We'll add some basic styles

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState(() => localStorage.getItem('flowops_remembered_username') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isRememberedUser, setIsRememberedUser] = useState(() => !!localStorage.getItem('flowops_remembered_username'));
  const [error, setError] = useState('');

  const handleSwitchUser = () => {
    localStorage.removeItem('flowops_remembered_username');
    setUsername('');
    setPassword('');
    setIsRememberedUser(false);
    setRememberMe(false);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    if (!password) {
      setError('Password is required.');
      return;
    }

    const result = login(username, password, rememberMe);
    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('flowops_remembered_username', username);
      } else {
        localStorage.removeItem('flowops_remembered_username');
      }
      onLoginSuccess(result.user);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-brand">FlowOps</h1>
          <p className="login-subtitle">Enterprise Request & Workflow Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                readOnly={isRememberedUser}
                style={{ flex: 1 }}
              />
              {isRememberedUser && (
                <button
                  type="button"
                  onClick={handleSwitchUser}
                  className="btn-secondary"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                >
                  Switch User
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-group">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="show-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="form-group checkbox-group">
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe">Remember Me</label>
          </div>

          <button type="submit" className="btn-primary login-btn">
            Sign In
          </button>
        </form>

        <div className="demo-accounts">
           <p>Demo Accounts:</p>
           <ul>
             <li><strong>Employee:</strong> employee01 / FlowOps123</li>
             <li><strong>Approver:</strong> approver01 / FlowOps123</li>
             <li><strong>Processor:</strong> processor01 / FlowOps123</li>
           </ul>
        </div>
      </div>
    </div>
  );
}
