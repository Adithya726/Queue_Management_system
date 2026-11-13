import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import { useAuth } from '../contextapi/AuthContext';
import { getErrorMessage } from '../services/api';
import './auth.css';

function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
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
      await login(form);
      const nextPath = location.state?.from?.pathname || '/manager';
      navigate(nextPath, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="auth-page">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Manager login</h1>
          <p>Sign in with your registered manager account.</p>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
          <p className="auth-switch">
            New manager? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default Login;
