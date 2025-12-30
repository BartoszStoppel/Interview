import express from 'express';
import db from '../database/connection.js';

const router = express.Router();

// Get usage metrics
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const usage = db.prepare(`
      SELECT u.*, us.name as user_name, us.email as user_email
      FROM usage_metrics u
      JOIN users us ON u.user_id = us.id
      ORDER BY u.metric_date DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const { total } = db.prepare('SELECT COUNT(*) as total FROM usage_metrics').get();

    res.json({
      data: usage,
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

// Get usage statistics
router.get('/stats/summary', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        SUM(login_count) as total_logins,
        AVG(login_count) as avg_logins_per_record,
        SUM(features_used_count) as total_features_used,
        SUM(support_tickets_opened) as total_tickets_opened,
        SUM(support_tickets_resolved) as total_tickets_resolved,
        AVG(session_duration_minutes) as avg_session_duration
      FROM usage_metrics
    `).get();
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get feature usage breakdown
router.get('/stats/features', (req, res) => {
  try {
    const features = db.prepare(`
      SELECT 
        feature_usage,
        COUNT(*) as usage_count
      FROM usage_metrics
      WHERE feature_usage != ''
      GROUP BY feature_usage
      ORDER BY usage_count DESC
      LIMIT 20
    `).all();
    
    res.json(features);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
