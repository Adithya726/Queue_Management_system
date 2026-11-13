import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Button from '../components/ui/Button';
import { useAuth } from '../contextapi/AuthContext';
import { getErrorMessage } from '../services/api';
import './auth.css';

function Register() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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

    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(form);
      navigate('/manager', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <Navbar />
      <main className="auth-page">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h1>Create manager account</h1>
          <p>Register to start creating and managing queues.</p>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <div className="form-field">
            <label htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
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
              minLength={6}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
          <p className="auth-switch">
            Already registered? <Link to="/login">Login</Link>
          </p>
        </form>
      </main>
    </div>
  );
}

export default Register;
