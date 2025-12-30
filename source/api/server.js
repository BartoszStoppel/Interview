import express from 'express';
import cors from 'cors';
import usersRouter from '../routes/users.js';
import revenueRouter from '../routes/revenue.js';
import usageRouter from '../routes/usage.js';
import marketingRouter from '../routes/marketing.js';
import dashboardRouter from '../routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/revenue', revenueRouter);
app.use('/api/usage', usageRouter);
app.use('/api/marketing', marketingRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API available at http://localhost:${PORT}/api/dashboard`);
});
