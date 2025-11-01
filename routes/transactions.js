const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// Get all transactions
router.get('/', ensureAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .lean();

    res.render('transactions', {
      title: 'My Transactions',
      transactions
    });
  } catch (err) {
    console.error(err);
    res.render('error', { error: err });
  }
});

// Show add transaction form
router.get('/add', ensureAuth, (req, res) => {
  res.render('add-transaction', {
    title: 'Add Transaction'
  });
});

// Process add transaction
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    await Transaction.create({
      user: req.user.id,
      type,
      category,
      amount: parseFloat(amount),
      description,
      date: date || Date.now()
    });

    req.flash('success', 'Transaction added successfully');
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('error', { error: err });
  }
});

// Show edit transaction form
router.get('/edit/:id', ensureAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    }).lean();

    if (!transaction) {
      req.flash('error', 'Transaction not found');
      return res.redirect('/transactions');
    }

    // Format date for input field
    const formattedDate = new Date(transaction.date).toISOString().split('T')[0];

    res.render('edit-transaction', {
      title: 'Edit Transaction',
      transaction: { ...transaction, date: formattedDate }
    });
  } catch (err) {
    console.error(err);
    res.render('error', { error: err });
  }
});

// Update transaction
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;

    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      req.flash('error', 'Transaction not found');
      return res.redirect('/transactions');
    }

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        type,
        category,
        amount: parseFloat(amount),
        description,
        date
      },
      { new: true }
    );

    req.flash('success', 'Transaction updated successfully');
    res.redirect('/transactions');
  } catch (err) {
    console.error(err);
    res.render('error', { error: err });
  }
});

// Delete transaction
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!transaction) {
      req.flash('error', 'Transaction not found');
      return res.redirect('/transactions');
    }

    await Transaction.findByIdAndDelete(req.params.id);

    req.flash('success', 'Transaction deleted successfully');
    res.redirect('/transactions');
  } catch (err) {
    console.error(err);
    res.render('error', { error: err });
  }
});

module.exports = router;