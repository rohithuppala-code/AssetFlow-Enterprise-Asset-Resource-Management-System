import { useState } from 'react';
import { LockKeyhole, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../utils/errorHandler';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Resume operations, approvals, and reporting from your AssetFlow workspace."
      footerText="New to AssetFlow?"
      footerLabel="Create account"
      footerLink="/register"
    >
      {error ? <div className="alert">{error}</div> : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div className="field">
          <label htmlFor="login-email">Email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-muted)' }} />
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoFocus
              style={{ paddingLeft: '2.45rem' }}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="login-password">Password</label>
          <div style={{ position: 'relative' }}>
            <LockKeyhole size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-muted)' }} />
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              style={{ paddingLeft: '2.45rem' }}
            />
          </div>
          <span className="field-hint">Use the same account assigned within your organization directory.</span>
        </div>

        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in to AssetFlow'}
        </button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
