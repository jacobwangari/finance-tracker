import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTransactions, deleteTransaction } from '../services/api';
import { formatCurrency as currency, formatDate } from '../utils/format';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null); // id pending delete confirmation

  const load = () => {
    setLoading(true);
    getTransactions().then(res => setTransactions(res.data.transactions)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    setConfirmId(null);
    load();
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-list-ul"></i> My Transactions</h2>
        <Link to="/transactions/add" className="btn btn-primary">
          <i className="bi bi-plus-circle"></i> Add Transaction
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="alert alert-info text-center">
          No transactions found. <Link to="/transactions/add">Add your first transaction</Link>
        </div>
      ) : (
        <div className="card">
          <div className="card-body table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Date</th><th>Type</th><th>Category</th><th>Description</th>
                  <th className="text-end">Amount</th><th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id}>
                    <td>{formatDate(t.date)}</td>
                    <td>
                      <span className={`badge ${t.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                        <i className={`bi bi-arrow-${t.type === 'income' ? 'up' : 'down'}-circle`}></i> {t.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td>{t.category}</td>
                    <td>{t.description}</td>
                    <td className="text-end">
                      <strong className={t.type === 'income' ? 'text-success' : 'text-danger'}>
                        {t.type === 'income' ? '+' : '-'}{currency(t.amount)}
                      </strong>
                    </td>
                    <td className="text-center">
                      <Link to={`/transactions/edit/${t._id}`} className="btn btn-sm btn-warning me-1">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button className="btn btn-sm btn-danger" onClick={() => setConfirmId(t._id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmId && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button className="btn-close" onClick={() => setConfirmId(null)}></button>
              </div>
              <div className="modal-body">
                Are you sure you want to delete this transaction?
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setConfirmId(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={() => handleDelete(confirmId)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}