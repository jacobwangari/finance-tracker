import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getDashboard } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const currency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const COLORS = [
  '#7c5cff', '#4ea1ff', '#2ecf8e', '#ff5c7a', '#ffb454',
  '#ff8fd8', '#5ce1e6', '#c4a1ff', '#f2ff5c', '#5cffb4'
];

const chartOptions = {
  plugins: {
    legend: {
      labels: { color: '#e6e8ec' }
    },
    tooltip: {
      backgroundColor: '#1b1e29',
      titleColor: '#e6e8ec',
      bodyColor: '#e6e8ec',
      borderColor: '#2a2e3d',
      borderWidth: 1
    }
  }
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!data) return <p className="text-center text-danger">Failed to load dashboard.</p>;

  const { transactions, totalIncome, totalExpenses, balance, expensesByCategory } = data;
  const labels = Object.keys(expensesByCategory);
  const values = Object.values(expensesByCategory);

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: COLORS.slice(0, labels.length),
      borderColor: '#1b1e29',
      borderWidth: 2
    }]
  };

  return (
    <>
      <h2 className="mb-4"><i className="bi bi-speedometer2"></i> Dashboard</h2>

      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card ft-stat-income p-3">
            <h5><i className="bi bi-arrow-up-circle"></i> Total Income</h5>
            <h2 className="mb-0">{currency(totalIncome)}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card ft-stat-expense p-3">
            <h5><i className="bi bi-arrow-down-circle"></i> Total Expenses</h5>
            <h2 className="mb-0">{currency(totalExpenses)}</h2>
          </div>
        </div>
        <div className="col-md-4">
          <div className={`card ft-stat-balance p-3 ${balance < 0 ? 'negative' : ''}`}>
            <h5><i className="bi bi-wallet2"></i> Balance</h5>
            <h2 className="mb-0">{currency(balance)}</h2>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header"><h5 className="mb-0"><i className="bi bi-pie-chart"></i> Expenses by Category</h5></div>
            <div className="card-body">
              {labels.length > 0
                ? <Pie data={chartData} options={chartOptions} />
                : <p className="text-muted text-center">No expense data to display. Add some expenses to see the chart!</p>}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-clock-history"></i> Recent Transactions</h5>
              <Link to="/transactions" className="btn btn-sm btn-primary">View All</Link>
            </div>
            <div className="card-body">
              {transactions.length > 0 ? (
                <div className="list-group">
                  {transactions.map(t => (
                    <div className="list-group-item" key={t._id}>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{t.description}</h6>
                          <small className="text-muted">
                            <i className="bi bi-tag"></i> {t.category} • <i className="bi bi-calendar"></i> {formatDate(t.date)}
                          </small>
                        </div>
                        <span className={`badge fs-6 ${t.type === 'income' ? 'bg-success' : 'bg-danger'}`}>
                          {t.type === 'income' ? '+' : '-'}{currency(t.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center">No transactions yet. <Link to="/transactions/add">Add your first transaction</Link></p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link to="/transactions/add" className="btn btn-primary btn-lg">
          <i className="bi bi-plus-circle"></i> Add New Transaction
        </Link>
      </div>
    </>
  );
}