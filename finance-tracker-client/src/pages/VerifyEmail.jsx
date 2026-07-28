import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const hasRun = useRef(false); // prevents StrictMode's double-invoke from firing this twice

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }

    verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Verification failed.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow text-center">
          <div className="card-body p-5">
            {status === 'verifying' && (
              <>
                <div className="spinner-border ft-icon-accent mb-3" role="status"></div>
                <h3>Verifying your email...</h3>
              </>
            )}

            {status === 'success' && (
              <>
                <i className="bi bi-check-circle ft-icon-income" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">Email Verified</h3>
                <p className="text-muted">{message}</p>
                <Link to="/login" className="btn btn-primary mt-2">Go to Login</Link>
              </>
            )}

            {status === 'error' && (
              <>
                <i className="bi bi-x-circle text-danger" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3">Verification Failed</h3>
                <p className="text-muted">{message}</p>
                <Link to="/login" className="btn btn-secondary mt-2">Back to Login</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}