import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { githubLoginUrl } from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', password2: '' });
  const [errors, setErrors] = useState([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setErrors(err.response?.data?.errors || ['Registration failed']);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-body p-5">
            <h2 className="text-center mb-4"><i className="bi bi-person-plus"></i> Register</h2>

            {errors.map((msg, i) => (
              <div className="alert alert-danger" key={i}>{msg}</div>
            ))}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-control" value={form.name} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password</label>
                <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required />
                <small className="text-muted">At least 6 characters</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input type="password" name="password2" className="form-control" value={form.password2} onChange={handleChange} required />
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3">
                <i className="bi bi-person-plus"></i> Register
              </button>
            </form>

            <div className="text-center mb-3"><span className="text-muted">OR</span></div>

            <a href={githubLoginUrl} className="btn btn-dark w-100">
              <i className="bi bi-github"></i> Sign up with GitHub
            </a>

            <hr className="my-4" />
            <p className="text-center mb-0">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}