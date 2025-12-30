import express from 'express';
import db from '../database/connection.js';

const router = express.Router();

// Get marketing campaigns
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const campaignDateFrom = req.query.campaignDateFrom;
    const campaignDateTo = req.query.campaignDateTo;
    const acquisitionChannel = req.query.acquisitionChannel;
    const funnelStage = req.query.funnelStage;
    const impressionsMin = req.query.impressionsMin;
    const impressionsMax = req.query.impressionsMax;
    const clicksMin = req.query.clicksMin;
    const clicksMax = req.query.clicksMax;
    const conversionsMin = req.query.conversionsMin;
    const conversionsMax = req.query.conversionsMax;
    const costMin = req.query.costMin;
    const costMax = req.query.costMax;

    let query = `
      SELECT m.*, u.name as user_name, u.email as user_email
      FROM marketing m
      LEFT JOIN users u ON m.user_id = u.id
    `;
    let countQuery = 'SELECT COUNT(*) as total FROM marketing m';
    const conditions = [];
    const params = [];

    if (campaignDateFrom) {
      conditions.push('m.campaign_date >= ?');
      params.push(campaignDateFrom);
    }
    if (campaignDateTo) {
      conditions.push('m.campaign_date <= ?');
      params.push(campaignDateTo);
    }
    if (acquisitionChannel) {
      conditions.push('m.acquisition_channel = ?');
      params.push(acquisitionChannel);
    }
    if (funnelStage) {
      conditions.push('m.funnel_stage = ?');
      params.push(funnelStage);
    }
    if (impressionsMin) {
      conditions.push('m.impressions >= ?');
      params.push(parseInt(impressionsMin));
    }
    if (impressionsMax) {
      conditions.push('m.impressions <= ?');
      params.push(parseInt(impressionsMax));
    }
    if (clicksMin) {
      conditions.push('m.clicks >= ?');
      params.push(parseInt(clicksMin));
    }
    if (clicksMax) {
      conditions.push('m.clicks <= ?');
      params.push(parseInt(clicksMax));
    }
    if (conversionsMin) {
      conditions.push('m.conversions >= ?');
      params.push(parseInt(conversionsMin));
    }
    if (conversionsMax) {
      conditions.push('m.conversions <= ?');
      params.push(parseInt(conversionsMax));
    }
    if (costMin) {
      conditions.push('m.cost >= ?');
      params.push(parseFloat(costMin));
    }
    if (costMax) {
      conditions.push('m.cost <= ?');
      params.push(parseFloat(costMax));
    }

    if (conditions.length > 0) {
      const whereClause = ' WHERE ' + conditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY m.campaign_date DESC LIMIT ? OFFSET ?';

    const marketing = db.prepare(query).all(...params, limit, offset);
    const { total } = db.prepare(countQuery).get(...params);

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
