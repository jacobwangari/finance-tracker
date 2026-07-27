const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// GET /api/dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    const allTransactions = await Transaction.find({ user: req.user.id }).lean();

    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const expensesByCategory = {};
    allTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });

    res.json({
      transactions,
      totalIncome,
      totalExpenses,
      balance,
      expensesByCategory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/public-transactions
router.get('/public-transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name')
      .sort({ date: -1 })
      .lean();
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;