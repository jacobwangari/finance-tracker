const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other Income'],
  expense: ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities',
    'Healthcare', 'Education', 'Travel', 'Personal', 'Other Expense']
};

export default function TransactionForm({ form, onChange, onSubmit, submitLabel, cancelTo }) {
  const categoryOptions = form.type === 'income' ? CATEGORIES.income
    : form.type === 'expense' ? CATEGORIES.expense
    : [...CATEGORIES.income, ...CATEGORIES.expense];

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-3">
        <label className="form-label">Type</label>
        <select className="form-select" name="type" value={form.type} onChange={onChange} required>
          <option value="">Choose...</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Category</label>
        <select className="form-select" name="category" value={form.category} onChange={onChange} required>
          <option value="">Choose...</option>
          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Amount</label>
        <div className="input-group">
          <span className="input-group-text">$</span>
          <input type="number" step="0.01" min="0" className="form-control"
            name="amount" value={form.amount} onChange={onChange} required />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <input type="text" className="form-control" name="description"
          value={form.description} onChange={onChange} required />
      </div>

      <div className="mb-3">
        <label className="form-label">Date</label>
        <input type="date" className="form-control" name="date"
          value={form.date} onChange={onChange} required />
      </div>

      <div className="d-grid gap-2">
        <button type="submit" className="btn btn-primary">
          <i className="bi bi-check-circle"></i> {submitLabel}
        </button>
        <a href={cancelTo} className="btn btn-secondary">Cancel</a>
      </div>
    </form>
  );
}