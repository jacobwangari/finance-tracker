import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await forgotPassword(email);
      setMessage(res.data.message);
      setSubmitted(true);
    } catch {
      // Backend intentionally returns a generic message either way, but just in case
      setMessage('If that account exists, a password reset email has been sent.');
      setSubmitted(true);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-body p-5">
            <h2 className="text-center mb-4"><i className="bi bi-key"></i> Forgot Password</h2>

            {submitted ? (
              <div className="text-center">
                <i className="bi bi-envelope-check ft-icon-income" style={{ fontSize: '2.5rem' }}></i>
                <p className="mt-3 text-muted">{message}</p>
                <Link to="/login" className="btn btn-primary mt-2">Back to Login</Link>
              </div>
            ) : (
              <>
                <p className="text-muted text-center mb-4">
                  Enter your email and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={email}
                      onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary w-100 mb-3">
                    Send Reset Link
                  </button>
                </form>
                <p className="text-center mb-0">
                  <Link to="/login">Back to Login</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}