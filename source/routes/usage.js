import express from 'express';
import db from '../database/connection.js';

const router = express.Router();

// Get usage metrics
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const metricDateFrom = req.query.metricDateFrom;
    const metricDateTo = req.query.metricDateTo;
    const loginCountMin = req.query.loginCountMin;
    const loginCountMax = req.query.loginCountMax;
    const featuresUsedMin = req.query.featuresUsedMin;
    const featuresUsedMax = req.query.featuresUsedMax;
    const ticketsOpenedMin = req.query.ticketsOpenedMin;
    const ticketsOpenedMax = req.query.ticketsOpenedMax;
    const sessionDurationMin = req.query.sessionDurationMin;
    const sessionDurationMax = req.query.sessionDurationMax;

    let query = `
      SELECT u.*, us.name as user_name, us.email as user_email
      FROM usage_metrics u
      JOIN users us ON u.user_id = us.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM usage_metrics u';
    const conditions = [];
    const params = [];

    if (metricDateFrom) {
      conditions.push('u.metric_date >= ?');
      params.push(metricDateFrom);
    }
    if (metricDateTo) {
      conditions.push('u.metric_date <= ?');
      params.push(metricDateTo);
    }
    if (loginCountMin) {
      conditions.push('u.login_count >= ?');
      params.push(parseInt(loginCountMin));
    }
    if (loginCountMax) {
      conditions.push('u.login_count <= ?');
      params.push(parseInt(loginCountMax));
    }
    if (featuresUsedMin) {
      conditions.push('u.features_used_count >= ?');
      params.push(parseInt(featuresUsedMin));
    }
    if (featuresUsedMax) {
      conditions.push('u.features_used_count <= ?');
      params.push(parseInt(featuresUsedMax));
    }
    if (ticketsOpenedMin) {
      conditions.push('u.support_tickets_opened >= ?');
      params.push(parseInt(ticketsOpenedMin));
    }
    if (ticketsOpenedMax) {
      conditions.push('u.support_tickets_opened <= ?');
      params.push(parseInt(ticketsOpenedMax));
    }
    if (sessionDurationMin) {
      conditions.push('u.session_duration_minutes >= ?');
      params.push(parseFloat(sessionDurationMin));
    }
    if (sessionDurationMax) {
      conditions.push('u.session_duration_minutes <= ?');
      params.push(parseFloat(sessionDurationMax));
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY u.metric_date DESC LIMIT ? OFFSET ?';

    const usage = db.prepare(query).all(...params, limit, offset);
    const { total } = db.prepare(countQuery).get(...params);

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
