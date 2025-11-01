const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const methodOverride = require('method-override');
const flash = require('express-flash');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const indexRoutes = require('./routes/index');

const app = express();

// Connect to database
connectDB();

// Passport config
require('./config/passport')(passport);

// Handlebars helpers
const hbs = engine({
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    eq: (a, b) => a === b,
    formatDate: (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    formatCurrency: (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }
  }
});

// View engine
app.engine('.hbs', hbs);
app.set('view engine', '.hbs');
app.set('views', './views');

// Body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Method override
app.use(methodOverride('_method'));

// Express session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    })
  })
);

// Flash messages
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/transactions', transactionRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});