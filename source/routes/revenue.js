import express from 'express';
import db from '../database/connection.js';

const router = express.Router();

// Get all revenue transactions
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const transactionDateFrom = req.query.transactionDateFrom;
    const transactionDateTo = req.query.transactionDateTo;
    const transactionType = req.query.transactionType;
    const tier = req.query.tier;
    const status = req.query.status;
    const amountMin = req.query.amountMin;
    const amountMax = req.query.amountMax;

    let query = `
      SELECT r.*, u.name as user_name, u.email as user_email
      FROM revenue r
      JOIN users u ON r.user_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM revenue r';
    const conditions = [];
    const params = [];

    if (transactionDateFrom) {
      conditions.push('date(r.transaction_date) >= ?');
      params.push(transactionDateFrom);
    }
    if (transactionDateTo) {
      conditions.push('date(r.transaction_date) <= ?');
      params.push(transactionDateTo);
    }
    if (transactionType) {
      conditions.push('r.transaction_type = ?');
      params.push(transactionType);
    }
    if (tier) {
      conditions.push('r.subscription_tier = ?');
      params.push(tier);
    }
    if (status) {
      conditions.push('r.status = ?');
      params.push(status);
    }
    if (amountMin) {
      conditions.push('r.amount >= ?');
      params.push(parseFloat(amountMin));
    }
    if (amountMax) {
      conditions.push('r.amount <= ?');
      params.push(parseFloat(amountMax));
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY r.transaction_date DESC LIMIT ? OFFSET ?';

    const revenue = db.prepare(query).all(...params, limit, offset);
    const { total } = db.prepare(countQuery).get(...params);

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
        ABS(SUM(CASE WHEN transaction_type = 'refund' AND status = 'completed' THEN amount ELSE 0 END)) as refunds,
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
