import express from 'express';
import db from '../database/connection.js';

const router = express.Router();

// Get overall dashboard KPIs
router.get('/kpis', (req, res) => {
  try {
    // User metrics
    const userStats = db.prepare(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN churn_status = 'active' THEN 1 ELSE 0 END) as active_users,
        SUM(CASE WHEN churn_status = 'churned' THEN 1 ELSE 0 END) as churned_users
      FROM users
    `).get();

    // Revenue metrics
    const revenueStats = db.prepare(`
      SELECT 
        SUM(CASE WHEN transaction_type = 'mrr' AND status = 'completed' THEN amount ELSE 0 END) as total_mrr,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_revenue
      FROM revenue
    `).get();

    // Recent growth (last 30 days)
    const growthStats = db.prepare(`
      SELECT 
        COUNT(*) as new_users_30d
      FROM users
      WHERE date(signup_date) >= date('now', '-30 days')
    `).get();

    // Support tickets
    const supportStats = db.prepare(`
      SELECT 
        SUM(support_tickets_opened) as total_tickets_opened,
        SUM(support_tickets_resolved) as total_tickets_resolved
      FROM usage_metrics
    `).get();

    const churnRate = userStats.total_users > 0 
      ? ((userStats.churned_users / userStats.total_users) * 100).toFixed(2)
      : 0;

    res.json({
      users: {
        total: userStats.total_users,
        active: userStats.active_users,
        churned: userStats.churned_users,
        churnRate: parseFloat(churnRate),
        newLast30Days: growthStats.new_users_30d
      },
      revenue: {
        totalMRR: revenueStats.total_mrr || 0,
        totalRevenue: revenueStats.total_revenue || 0,
        averageRevenuePerUser: userStats.active_users > 0 
          ? ((revenueStats.total_revenue || 0) / userStats.active_users).toFixed(2)
          : 0
      },
      support: {
        totalTicketsOpened: supportStats.total_tickets_opened || 0,
        totalTicketsResolved: supportStats.total_tickets_resolved || 0,
        resolutionRate: supportStats.total_tickets_opened > 0
          ? ((supportStats.total_tickets_resolved / supportStats.total_tickets_opened) * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user growth over time
router.get('/user-growth', (req, res) => {
  try {
    const growth = db.prepare(`
      SELECT 
        strftime('%Y-%m', signup_date) as month,
        COUNT(*) as new_users,
        SUM(COUNT(*)) OVER (ORDER BY strftime('%Y-%m', signup_date)) as cumulative_users
      FROM users
      GROUP BY month
      ORDER BY month
    `).all();
    
    res.json(growth);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
