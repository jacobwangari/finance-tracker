const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// Home page
router.get('/', (req, res) => {
  res.render('home', {
    title: 'Welcome to Finance Tracker'
  });
});

// Dashboard
router.get('/dashboard', ensureAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5)
      .lean();

    // Calculate totals
    const allTransactions = await Transaction.find({ user: req.user.id }).lean();
    
    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;

    // Group expenses by category for chart
    const expensesByCategory = {};
    allTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        if (expensesByCategory[t.category]) {
          expensesByCategory[t.category] += t.amount;
        } else {
          expensesByCategory[t.category] = t.amount;
        }
      });

    res.render('dashboard', {
      title: 'Dashboard',
      transactions,
      totalIncome,
      totalExpenses,
      balance,
      expensesByCategory: JSON.stringify(expensesByCategory)
    });
  } catch (err) {
    console.error(err);
    res.render('error', { error: err });
  }
});

// Public transactions page (read-only)
router.get('/public-transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name')
      .sort({ date: -1 })
      .lean();

    res.render('public-transactions', {
      title: 'All Transactions',
      transactions
    });
  } catch (err) {
    console.error(err);
    res.render('error', { error: err });
  }
});

module.exports = router;