import express from 'express';
import db from '../database/connection.js';

const router = express.Router();

// Get all users with pagination
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const tier = req.query.tier;
    const status = req.query.status;
    const signupDateFrom = req.query.signupDateFrom;
    const signupDateTo = req.query.signupDateTo;

    let query = 'SELECT * FROM users';
    let countQuery = 'SELECT COUNT(*) as total FROM users';
    const conditions = [];
    const params = [];

    if (tier) {
      conditions.push('subscription_tier = ?');
      params.push(tier);
    }
    if (status) {
      conditions.push('churn_status = ?');
      params.push(status);
    }
    if (signupDateFrom) {
      conditions.push('date(signup_date) >= ?');
      params.push(signupDateFrom);
    }
    if (signupDateTo) {
      conditions.push('date(signup_date) <= ?');
      params.push(signupDateTo);
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY signup_date DESC LIMIT ? OFFSET ?';

    const users = db.prepare(query).all(...params, limit, offset);
    const { total } = db.prepare(countQuery).get(...params);

    res.json({
      data: users,
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

// Get user by ID
router.get('/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user statistics
router.get('/stats/summary', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN churn_status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN churn_status = 'churned' THEN 1 ELSE 0 END) as churned_users,
        SUM(CASE WHEN churn_status = 'at_risk' THEN 1 ELSE 0 END) as at_risk_users,
        SUM(CASE WHEN subscription_tier = 'free' THEN 1 ELSE 0 END) as free_tier,
        SUM(CASE WHEN subscription_tier = 'starter' THEN 1 ELSE 0 END) as starter_tier,
        SUM(CASE WHEN subscription_tier = 'professional' THEN 1 ELSE 0 END) as professional_tier,
        SUM(CASE WHEN subscription_tier = 'enterprise' THEN 1 ELSE 0 END) as enterprise_tier
      FROM users
    `).get();
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
