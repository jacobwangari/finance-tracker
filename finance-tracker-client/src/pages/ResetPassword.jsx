import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ password: '', password2: '' });
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    if (!token) {
      setErrors(['Missing or invalid reset link.']);
      return;
    }

    try {
      await resetPassword({ token, ...form });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setErrors(err.response?.data?.errors || ['Something went wrong.']);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-body p-5">
            <h2 className="text-center mb-4"><i className="bi bi-shield-lock"></i> Reset Password</h2>

            {success ? (
              <div className="text-center">
                <i className="bi bi-check-circle ft-icon-income" style={{ fontSize: '2.5rem' }}></i>
                <p className="mt-3 text-muted">Password reset successfully. Redirecting to login...</p>
              </div>
            ) : (
              <>
                {errors.map((msg, i) => (
                  <div className="alert alert-danger" key={i}>{msg}</div>
                ))}

                {!token && (
                  <div className="alert alert-danger">
                    This link is missing its token. Please use the link from your email, or{' '}
                    <Link to="/forgot-password">request a new one</Link>.
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input type="password" name="password" className="form-control"
                      value={form.password} onChange={handleChange} required />
                    <small className="text-muted">At least 6 characters</small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" name="password2" className="form-control"
                      value={form.password2} onChange={handleChange} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100" disabled={!token}>
                    Reset Password
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}