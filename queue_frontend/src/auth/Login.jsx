import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Button from '../components/ui/Button';
import Brand from '../components/common/Brand';
import { useAuth } from '../contextapi/useAuth';
import { getErrorMessage } from '../services/api';

function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/manager" replace />;
  }

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      const nextPath = location.state?.from?.pathname || '/manager';
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-split">
      <aside className="auth-brand">
        <Link to="/">
          <Brand />
        </Link>
        <div className="auth-brand-body">
          <h2>Shorter lines. Calmer counters.</h2>
          <p>Issue tokens, serve people in order and see exactly how long everyone waits.</p>
          <div className="auth-tickets">
            <div className="auth-ticket">
              <strong>#024</strong>
              <span>Now serving</span>
            </div>
            <div className="auth-ticket">
              <strong>6</strong>
              <span>Waiting</span>
            </div>
            <div className="auth-ticket">
              <strong>3.2m</strong>
              <span>Avg wait</span>
            </div>
          </div>
        </div>
        <span className="auth-foot">QueueFlow · Queue Management System</span>
      </aside>
      <main className="auth-form-side">
        <form className="auth-form" onSubmit={handleSubmit}>
          <Link to="/" className="auth-back">
            <ArrowLeft size={15} /> Back to home
          </Link>
          <h1>Welcome back</h1>
          <p>Sign in to manage your queues.</p>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <div className="input-icon">
              <Mail size={16} />
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="input-icon">
              <Lock size={16} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="input-suffix"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
          <p className="auth-switch">
            New here? <Link to="/register">Create a manager account</Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default Login;
