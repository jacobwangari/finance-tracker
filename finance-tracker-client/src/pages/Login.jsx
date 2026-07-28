import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { githubLoginUrl, resendVerification } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [unverified, setUnverified] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverified(false);
    setResendStatus('');
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      if (err.response?.data?.unverified) setUnverified(true);
    }
  };

  const handleResend = async () => {
    setResendStatus('Sending...');
    try {
      const res = await resendVerification(email);
      setResendStatus(res.data.message);
    } catch {
      setResendStatus('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-body p-5">
            <h2 className="text-center mb-4"><i className="bi bi-box-arrow-in-right"></i> Login</h2>

            {error && (
              <div className="alert alert-danger">
                {error}
                {unverified && (
                  <div className="mt-2">
                    <button type="button" className="btn btn-sm btn-outline-light" onClick={handleResend}>
                      Resend verification email
                    </button>
                  </div>
                )}
              </div>
            )}
            {resendStatus && <div className="alert alert-info">{resendStatus}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={email}
                  onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <label className="form-label">Password</label>
                  <Link to="/forgot-password" className="small">Forgot password?</Link>
                </div>
                <input type="password" className="form-control" value={password}
                  onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-3">
                <i className="bi bi-box-arrow-in-right"></i> Login
              </button>
            </form>

            <div className="text-center mb-3"><span className="text-muted">OR</span></div>

            <a href={githubLoginUrl} className="btn btn-dark w-100">
              <i className="bi bi-github"></i> Login with GitHub
            </a>

            <hr className="my-4" />
            <p className="text-center mb-0">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}