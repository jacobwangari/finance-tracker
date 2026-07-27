import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionForm from '../components/TransactionForm';
import { addTransaction } from '../services/api';

const today = new Date().toISOString().split('T')[0];

export default function AddTransaction() {
  const [form, setForm] = useState({ type: '', category: '', amount: '', description: '', date: today });
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTransaction(form);
    navigate('/dashboard');
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <div className="card-header"><h3 className="mb-0"><i className="bi bi-plus-circle"></i> Add Transaction</h3></div>
          <div className="card-body">
            <TransactionForm form={form} onChange={handleChange} onSubmit={handleSubmit}
              submitLabel="Add Transaction" cancelTo="/dashboard" />
          </div>
        </div>
      </div>
    </div>
  );
}