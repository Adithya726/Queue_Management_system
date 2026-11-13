import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import Button from '../components/ui/Button';
import Brand from '../components/common/Brand';
import { useAuth } from '../contextapi/AuthContext';
import { getErrorMessage } from '../services/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/manager" replace />;
  }

  const fieldErrors = {
    name: form.name.trim() ? '' : 'Name is required',
    email: EMAIL_RE.test(form.email.trim()) ? '' : 'Enter a valid email',
    password: form.password.length >= 6 ? '' : 'At least 6 characters',
  };
  const isValid = !fieldErrors.name && !fieldErrors.email && !fieldErrors.password;

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };
  const handleBlur = (event) => {
    setTouched((prev) => ({ ...prev, [event.target.name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true });
    setError('');
    if (!isValid) {
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/manager', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
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
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Link to="/" className="auth-back">
            <ArrowLeft size={15} /> Back to home
          </Link>
          <h1>Create your account</h1>
          <p>Set up a manager account in seconds.</p>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <div className="input-icon">
              <User size={16} />
              <input id="name" name="name" autoComplete="name" placeholder="Your name" value={form.name} onChange={handleChange} onBlur={handleBlur} />
            </div>
            {touched.name && fieldErrors.name ? <span className="field-error">{fieldErrors.name}</span> : null}
          </div>
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <div className="input-icon">
              <Mail size={16} />
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" value={form.email} onChange={handleChange} onBlur={handleBlur} />
            </div>
            {touched.email && fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="input-icon">
              <Lock size={16} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
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
            {touched.password && fieldErrors.password ? <span className="field-error">{fieldErrors.password}</span> : null}
          </div>
          <Button type="submit" size="lg" fullWidth disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default Register;
