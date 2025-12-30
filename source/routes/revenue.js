import express from 'express';
import db from '../database/connection.js';

const router = express.Router();

// Get all revenue transactions
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const revenue = db.prepare(`
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM revenue r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.transaction_date DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const { total } = db.prepare('SELECT COUNT(*) as total FROM revenue').get();

    res.json({
      data: revenue,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue statistics
router.get('/stats/summary', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        SUM(CASE WHEN transaction_type = 'mrr' AND status = 'completed' THEN amount ELSE 0 END) as total_mrr,
        SUM(CASE WHEN transaction_type = 'one_time' AND status = 'completed' THEN amount ELSE 0 END) as total_one_time,
        SUM(CASE WHEN transaction_type = 'refund' THEN amount ELSE 0 END) as total_refunds,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        COUNT(*) as total_transactions,
        AVG(CASE WHEN status = 'completed' THEN amount END) as avg_transaction
      FROM revenue
    `).get();
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly revenue trend
router.get('/stats/monthly', (req, res) => {
  try {
    const monthlyRevenue = db.prepare(`
      SELECT 
        strftime('%Y-%m', transaction_date) as month,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue,
        SUM(CASE WHEN transaction_type = 'mrr' AND status = 'completed' THEN amount ELSE 0 END) as mrr,
        COUNT(*) as transaction_count
      FROM revenue
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all();
    
    res.json(monthlyRevenue.reverse());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
