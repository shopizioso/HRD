import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import initializeDatabase from './database/init.js';
import authRoutes from './routes/auth.js';
import payrollRoutes from './routes/payroll.js';
import employeeRoutes from './routes/employees.js';
import reportRoutes from './routes/reports.js';
import pdfRoutes from './routes/pdf.js';
import backupRoutes from './routes/backup.js';
import auditRoutes from './routes/audit.js';
import incomeRoutes from './routes/income.js';
import expenseRoutes from './routes/expense.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Session & Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));
app.use(passport.initialize());
app.use(passport.session());

// Initialize Database
await initializeDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payroll', authenticateToken, payrollRoutes);
app.use('/api/employees', authenticateToken, employeeRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/pdf', authenticateToken, pdfRoutes);
app.use('/api/backup', authenticateToken, backupRoutes);
app.use('/api/audit', authenticateToken, auditRoutes);
app.use('/api/income', authenticateToken, incomeRoutes);
app.use('/api/expense', authenticateToken, expenseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend server running', timestamp: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 HRD Payroll Backend running on http://localhost:${PORT}`);
});
