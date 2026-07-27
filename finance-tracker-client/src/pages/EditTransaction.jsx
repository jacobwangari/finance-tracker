import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import { getTransaction, updateTransaction } from '../services/api';

export default function EditTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTransaction(id).then(res => {
      const t = res.data.transaction;
      setForm({
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.description,
        date: new Date(t.date).toISOString().split('T')[0]
      });
    }).finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateTransaction(id, form);
    navigate('/transactions');
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (!form) return <p className="text-center text-danger">Transaction not found.</p>;

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <div className="card-header"><h3 className="mb-0"><i className="bi bi-pencil"></i> Edit Transaction</h3></div>
          <div className="card-body">
            <TransactionForm form={form} onChange={handleChange} onSubmit={handleSubmit}
              submitLabel="Update Transaction" cancelTo="/transactions" />
          </div>
        </div>
      </div>
    </div>
  );
}