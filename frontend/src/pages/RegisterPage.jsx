import { useState } from 'react';
import { BadgeCheck, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../utils/errorHandler';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your workspace access"
      subtitle="Set up your account to view assets, bookings, approvals, and maintenance requests."
      footerText="Already have access?"
      footerLabel="Go to sign in"
      footerLink="/login"
    >
      {error ? <div className="alert">{error}</div> : null}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <div className="field">
          <label htmlFor="register-name">Full name</label>
          <div style={{ position: 'relative' }}>
            <UserRound size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-muted)' }} />
            <input
              id="register-name"
              className="input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Priya Sharma"
              required
              autoFocus
              style={{ paddingLeft: '2.45rem' }}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="register-email">Work email</label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-muted)' }} />
            <input
              id="register-email"
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="priya@company.com"
              required
              style={{ paddingLeft: '2.45rem' }}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="register-role">Starting role</label>
          <div style={{ position: 'relative' }}>
            <BadgeCheck size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-muted)' }} />
            <select id="register-role" className="select" value={role} onChange={(event) => setRole(event.target.value)} style={{ paddingLeft: '2.45rem' }}>
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
              <option value="AssetManager">Asset Manager</option>
            </select>
          </div>
          <span className="field-hint">The API currently supports multiple roles at signup, so the UI preserves that behavior.</span>
        </div>

        <div className="field">
          <label htmlFor="register-password">Password</label>
          <div style={{ position: 'relative' }}>
            <LockKeyhole size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-muted)' }} />
            <input
              id="register-password"
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
              style={{ paddingLeft: '2.45rem' }}
            />
          </div>
        </div>

        <button type="submit" className="button button-primary" disabled={loading}>
          {loading ? 'Creating account...' : 'Create AssetFlow account'}
        </button>
      </form>
    </AuthShell>
  );
}

export default RegisterPage;
