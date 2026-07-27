import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <>
      <div className="p-5 rounded-3 mb-4 text-center text-white"
           style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <h1 className="display-4"><i className="bi bi-wallet2"></i> Personal Finance Tracker</h1>
        <p className="lead">Take control of your finances with our easy-to-use expense tracking application</p>
        <hr className="my-4" />
        <p>Track your income and expenses, visualize your spending patterns, and achieve your financial goals.</p>
        {user ? (
          <Link className="btn btn-primary btn-lg" to="/dashboard">
            Go to Dashboard <i className="bi bi-arrow-right"></i>
          </Link>
        ) : (
          <>
            <Link className="btn btn-primary btn-lg me-2" to="/register">Get Started</Link>
            <Link className="btn btn-outline-light btn-lg" to="/login">Login</Link>
          </>
        )}
      </div>

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center p-4">
            <i className="bi bi-graph-up text-primary" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">Track Transactions</h5>
            <p>Easily record and categorize your income and expenses in one place.</p>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center p-4">
            <i className="bi bi-pie-chart text-success" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">Visualize Spending</h5>
            <p>See where your money goes with interactive charts and graphs.</p>
          </div>
        </div>
        <div className="col-md-4 mb-4">
          <div className="card h-100 text-center p-4">
            <i className="bi bi-shield-check text-info" style={{ fontSize: '3rem' }}></i>
            <h5 className="mt-3">Secure & Private</h5>
            <p>Your financial data is encrypted and kept private with secure authentication.</p>
          </div>
        </div>
      </div>
    </>
  );
}