import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPublicTransactions } from '../services/api';

const currency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export default function PublicTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getPublicTransactions().then(res => setTransactions(res.data.transactions)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <>
      <div className="mb-4">
        <h2><i className="bi bi-eye"></i> All Transactions (Public View)</h2>
        <p className="text-muted">This is a read-only view of all transactions in the database.</p>
      </div>

      {transactions.length === 0 ? (
        <div className="alert alert-info text-center">No transactions available yet.</div>
      ) : (
        <div className="card">
          <div className="card-body table-responsive">
            <table className="table table-hover">
              <thead>
                <tr><th>User</th><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th className="text-end">Amount</th></tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id}>
                    <td>{t.user?.name}</td>
                    <td>{formatDate(t.date)}</td>
                    <td>
                      <span className={`badge ${t.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                        {t.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td>{t.category}</td>
                    <td>{t.description}</td>
                    <td className="text-end">
                      <strong className={t.type === 'income' ? 'text-success' : 'text-danger'}>
                        {t.type === 'income' ? '+' : '-'}{currency(t.amount)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        {user ? null : <p>Want to track your own finances? <a href="/register">Sign up now</a></p>}
      </div>
    </>
  );
}