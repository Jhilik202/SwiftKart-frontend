import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Message from '../components/Message';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  // Same rules as the backend, checked first so the user gets quick feedback
  const validate = () => {
    if (form.name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      return 'Password must contain at least one letter and one number.';
    }
    if (form.password !== form.confirmPassword) return 'The two passwords do not match.';
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await register(form.name.trim(), form.email.trim(), form.password);
      navigate('/', { replace: true }); // the backend logs the new user in
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="container page">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="auth-subtitle">It takes a minute. You can start shopping right after.</p>

        <Message type="error">{error}</Message>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange} autoComplete="name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" required />
            <small className="form-hint">At least 6 characters, with a letter and a number.</small>
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} autoComplete="new-password" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
