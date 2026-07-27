# Personal Finance Tracker

A full-stack web application for tracking personal income and expenses built with Node.js, Express, MongoDB, and Handlebars.

## Live Demo
[Insert your deployed URL here after deployment]

## Description
Personal Finance Tracker allows users to record and manage their financial transactions in a secure, user-friendly interface. Users can track income and expenses, categorize transactions, and visualize spending patterns through interactive charts.

## Features

### Core Functionality
- **User Authentication**: Local registration/login and GitHub OAuth integration
- **CRUD Operations**: Create, Read, Update, and Delete transactions
- **Private Dashboard**: Personalized view of financial data
- **Public View**: Read-only page displaying all transactions in the database

### Additional Feature: Data Visualization
Interactive pie chart showing expense breakdown by category using Chart.js. The dashboard displays:
- Total income, expenses, and current balance
- Visual representation of spending by category
- Recent transaction history

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **View Engine**: Handlebars (HBS)
- **Authentication**: Passport.js (Local Strategy & GitHub OAuth)
- **Styling**: Bootstrap 5, Bootstrap Icons
- **Charts**: Chart.js
- **Session Management**: Express-session with MongoDB store

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- GitHub account (for OAuth)

### Step 1: Clone the Repository
```bash
git clone https://github.com/jacobwangari/finance-tracker
cd finance-tracker
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Set Up MongoDB Atlas
1. Create a free account at [mongodb.com](https://www.mongodb.com/)
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address (0.0.0.0/0 for all IPs)
5. Get your connection string

### Step 4: Set Up GitHub OAuth
1. Go to GitHub Settings → Developer Settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - Application name: Finance Tracker
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/auth/github/callback
4. Save and copy your Client ID and Client Secret

### Step 5: Create .env File
Create a `.env` file in the root directory:
```
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_random_secret_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
PORT=3000
NODE_ENV=development
```

### Step 6: Run the Application
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

Visit `http://localhost:3000` in your browser.

## Deployment to Render

### Step 1: Prepare for Deployment
1. Ensure `.gitignore` includes `node_modules` and `.env`
2. Commit all code to your GitHub repository

### Step 2: Create Render Account
1. Sign up at [render.com](https://render.com)
2. Connect your GitHub account

### Step 3: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - Name: finance-tracker
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`

### Step 4: Add Environment Variables
Add these in the Render dashboard:
- `MONGODB_URI`
- `SESSION_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL` (update to your Render URL)
- `NODE_ENV=production`

### Step 5: Update GitHub OAuth
1. Go back to your GitHub OAuth app settings
2. Update the callback URL to: `https://your-app.onrender.com/auth/github/callback`

### Step 6: Deploy
Click "Create Web Service" and Render will automatically deploy your app.

## Project Structure
```
finance-tracker/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── passport.js           # Authentication strategies
├── middleware/
│   └── auth.js               # Authentication middleware
├── models/
│   ├── User.js               # User schema
│   └── Transaction.js        # Transaction schema
├── routes/
│   ├── index.js              # Home and dashboard routes
│   ├── auth.js               # Authentication routes
│   └── transactions.js       # Transaction CRUD routes
├── views/
│   ├── layouts/
│   │   └── main.hbs          # Main layout template
│   ├── partials/
│   │   ├── header.hbs        # Navigation header
│   │   └── footer.hbs        # Footer
│   ├── home.hbs              # Landing page
│   ├── login.hbs             # Login page
│   ├── register.hbs          # Registration page
│   ├── dashboard.hbs         # User dashboard with charts
│   ├── transactions.hbs      # All user transactions
│   ├── add-transaction.hbs   # Add transaction form
│   ├── edit-transaction.hbs  # Edit transaction form
│   └── public-transactions.hbs # Public read-only view
├── public/
│   ├── css/
│   │   └── style.css         # Custom styles
│   └── js/
│       └── charts.js         # Chart.js configuration
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── app.js                     # Main application file
├── package.json               # Dependencies
└── README.md                  # This file
```

## Usage

### Register/Login
- Create an account with email and password
- Or sign in with GitHub OAuth

### Add Transactions
1. Click "Add Transaction" button
2. Select type (Income/Expense)
3. Choose category
4. Enter amount and description
5. Select date
6. Submit

### View Dashboard
- See total income, expenses, and balance
- View pie chart of expenses by category
- Check recent transactions

### Manage Transactions
- View all transactions in a table
- Edit transaction details
- Delete transactions (with confirmation)

### Public View
Anyone can view all transactions in read-only mode at `/public-transactions`

## Screenshots
[Add screenshots of your application here]

## Future Enhancements
- Budget planning and alerts
- Export data to CSV
- Multiple currency support
- Mobile app version
- Recurring transactions
- Financial reports and insights

## License
MIT

## Author
Jacob Wangari

## Acknowledgments
- Bootstrap for responsive design
- Chart.js for data visualization
- MongoDB for database solution
- Passport.js for authentication