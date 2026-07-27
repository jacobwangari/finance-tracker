const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// GET /api/transactions
router.get('/', ensureAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 }).lean();
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/transactions
router.post('/', ensureAuth, async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;
    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      category,
      amount: parseFloat(amount),
      description,
      date: date || Date.now()
    });
    res.status(201).json({ transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/transactions/:id
router.get('/:id', ensureAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id }).lean();
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', ensureAuth, async (req, res) => {
  try {
    const { type, category, amount, description, date } = req.body;
    let transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { type, category, amount: parseFloat(amount), description, date },
      { new: true }
    );
    res.json({ transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;