import express from 'express';
import db from '../database/connection.js';

const router = express.Router();

// Get marketing campaigns
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const marketing = db.prepare(`
      SELECT m.*, u.name as user_name, u.email as user_email
      FROM marketing m
      LEFT JOIN users u ON m.user_id = u.id
      ORDER BY m.campaign_date DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const { total } = db.prepare('SELECT COUNT(*) as total FROM marketing').get();

    res.json({
      data: marketing,
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

// Get marketing statistics
router.get('/stats/summary', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(cost) as total_cost,
        SUM(conversion_value) as total_conversion_value,
        CAST(SUM(clicks) AS REAL) / NULLIF(SUM(impressions), 0) * 100 as avg_ctr,
        CAST(SUM(conversions) AS REAL) / NULLIF(SUM(clicks), 0) * 100 as avg_conversion_rate
      FROM marketing
    `).get();
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get campaign performance
router.get('/stats/campaigns', (req, res) => {
  try {
    const campaigns = db.prepare(`
      SELECT 
        campaign_name,
        acquisition_channel,
        SUM(impressions) as total_impressions,
        SUM(clicks) as total_clicks,
        SUM(conversions) as total_conversions,
        SUM(cost) as total_cost,
        SUM(conversion_value) as total_value,
        CAST(SUM(clicks) AS REAL) / NULLIF(SUM(impressions), 0) * 100 as ctr,
        CAST(SUM(conversions) AS REAL) / NULLIF(SUM(clicks), 0) * 100 as conversion_rate
      FROM marketing
      GROUP BY campaign_name, acquisition_channel
      ORDER BY total_conversions DESC
    `).all();
    
    res.json(campaigns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
