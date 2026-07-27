const express = require('express');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const indexRoutes = require('./routes/index');

const app = express();

connectDB();
require('./config/passport')(passport);

app.set('trust proxy', 1); // needed on Render for secure cookies to work behind its proxy

// credentials: true is required so the browser sends/receives the httpOnly refresh cookie.
// origin must be an explicit URL (not '*') for credentialed requests to work.
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());

app.use('/api', indexRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));