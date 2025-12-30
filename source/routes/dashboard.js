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

// Get revenue trends by type
router.get('/revenue-trends', (req, res) => {
  try {
    const trends = db.prepare(`
      SELECT 
        strftime('%Y-%m', transaction_date) as month,
        SUM(CASE WHEN transaction_type = 'mrr' AND status = 'completed' THEN amount ELSE 0 END) as mrr,
        SUM(CASE WHEN transaction_type = 'one_time' AND status = 'completed' THEN amount ELSE 0 END) as one_time,
        SUM(CASE WHEN transaction_type = 'refund' THEN ABS(amount) ELSE 0 END) as refunds,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as net_revenue
      FROM revenue
      GROUP BY month
      ORDER BY month
    `).all();
    
    res.json(trends);
  } catch (error) {
    console.error('Revenue trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get acquisition funnel data
router.get('/acquisition-funnel', (req, res) => {
  try {
    const funnel = db.prepare(`
      SELECT 
        funnel_stage,
        COUNT(DISTINCT user_id) as users,
        SUM(impressions) as impressions,
        SUM(clicks) as clicks,
        SUM(conversions) as conversions
      FROM marketing
      GROUP BY funnel_stage
      ORDER BY 
        CASE funnel_stage
          WHEN 'awareness' THEN 1
          WHEN 'consideration' THEN 2
          WHEN 'conversion' THEN 3
          WHEN 'retention' THEN 4
        END
    `).all();
    
    res.json(funnel);
  } catch (error) {
    console.error('Funnel error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get cohort retention analysis
router.get('/churn-cohorts', (req, res) => {
  try {
    // Get last 12 cohorts (oldest first)
    const cohortMonths = db.prepare(`
      SELECT DISTINCT strftime('%Y-%m', signup_date) as cohort
      FROM users
      WHERE signup_date >= date('now', '-12 months')
      ORDER BY cohort ASC
      LIMIT 12
    `).all().map(r => r.cohort);

    const cohortData = [];
    const now = new Date();

    cohortMonths.forEach(cohort => {
      const cohortRow = { cohort };
      const cohortDate = new Date(cohort + '-01');
      
      // Get initial cohort size (Month 0)
      const initialSize = db.prepare(`
        SELECT COUNT(*) as count
        FROM users
        WHERE strftime('%Y-%m', signup_date) = ?
      `).get(cohort).count;
      
      cohortRow.month_0 = initialSize;

      // Calculate retention for months 1-6
      for (let month = 1; month <= 6; month++) {
        // Check if this month has passed for this cohort
        const monthDate = new Date(cohortDate);
        monthDate.setMonth(monthDate.getMonth() + month);
        
        if (monthDate > now) {
          // Month hasn't occurred yet
          cohortRow[`month_${month}`] = null;
        } else {
          const retained = db.prepare(`
            SELECT COUNT(*) as count
            FROM users
            WHERE strftime('%Y-%m', signup_date) = ?
              AND churn_status = 'active'
              AND date(signup_date, '+' || ? || ' months') <= date('now')
          `).get(cohort, month).count;
          
          // Calculate retention percentage
          cohortRow[`month_${month}`] = initialSize > 0 ? Math.round((retained / initialSize) * 100) : 0;
        }
      }
      
      cohortData.push(cohortRow);
    });
    
    res.json(cohortData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get feature usage data for heatmap (features by tier)
router.get('/feature-usage', (req, res) => {
  try {
    const features = db.prepare(`
      SELECT 
        u.subscription_tier,
        um.feature_usage,
        COUNT(*) as usage_count
      FROM usage_metrics um
      JOIN users u ON um.user_id = u.id
      WHERE um.feature_usage != ''
      GROUP BY u.subscription_tier, um.feature_usage
      ORDER BY usage_count DESC
      LIMIT 200
    `).all();
    
    // Parse feature usage into individual features by tier
    const featureTierMap = new Map();
    const tiers = ['free', 'starter', 'professional', 'enterprise'];
    
    features.forEach(record => {
      const featureList = record.feature_usage.split(',');
      featureList.forEach(feature => {
        const trimmed = feature.trim();
        if (trimmed) {
          if (!featureTierMap.has(trimmed)) {
            featureTierMap.set(trimmed, { feature: trimmed, free: 0, starter: 0, professional: 0, enterprise: 0 });
          }
          const tierData = featureTierMap.get(trimmed);
          tierData[record.subscription_tier] += record.usage_count;
        }
      });
    });
    
    // Get top 10 features by total usage
    const result = Array.from(featureTierMap.values())
      .map(tierData => ({
        ...tierData,
        total: tierData.free + tierData.starter + tierData.professional + tierData.enterprise
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map(({ feature, free, starter, professional, enterprise }) => ({
        feature,
        free,
        starter,
        professional,
        enterprise
      }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user locations with coordinates
router.get('/user-locations', (req, res) => {
  try {
    const locations = db.prepare(`
      SELECT 
        location,
        COUNT(*) as user_count,
        SUM(CASE WHEN churn_status = 'active' THEN 1 ELSE 0 END) as active_users
      FROM users
      WHERE location IS NOT NULL AND location != ''
      GROUP BY location
      ORDER BY user_count DESC
    `).all();
    
    // Map city names to approximate coordinates
    const locationCoordinates = {
      'New York, NY': [-74.0060, 40.7128],
      'Los Angeles, CA': [-118.2437, 34.0522],
      'Chicago, IL': [-87.6298, 41.8781],
      'Houston, TX': [-95.3698, 29.7604],
      'Phoenix, AZ': [-112.0740, 33.4484],
      'Philadelphia, PA': [-75.1652, 39.9526],
      'San Antonio, TX': [-98.4936, 29.4241],
      'San Diego, CA': [-117.1611, 32.7157],
      'Dallas, TX': [-96.7970, 32.7767],
      'San Jose, CA': [-121.8863, 37.3382],
      'Austin, TX': [-97.7431, 30.2672],
      'Jacksonville, FL': [-81.6557, 30.3322],
      'San Francisco, CA': [-122.4194, 37.7749],
      'Columbus, OH': [-82.9988, 39.9612],
      'Indianapolis, IN': [-86.1581, 39.7684],
      'Seattle, WA': [-122.3321, 47.6062],
      'Denver, CO': [-104.9903, 39.7392],
      'Boston, MA': [-71.0589, 42.3601],
      'Portland, OR': [-122.6765, 45.5152],
      'Nashville, TN': [-86.7816, 36.1627],
      'Atlanta, GA': [-84.3880, 33.7490],
      'Miami, FL': [-80.1918, 25.7617],
      'Detroit, MI': [-83.0458, 42.3314],
      'Minneapolis, MN': [-93.2650, 44.9778],
      'Toronto, ON': [-79.3832, 43.6532],
      'Vancouver, BC': [-123.1216, 49.2827],
      'Montreal, QC': [-73.5673, 45.5017],
      'London, UK': [-0.1276, 51.5074],
      'Paris, France': [2.3522, 48.8566],
      'Berlin, Germany': [13.4050, 52.5200],
      'Tokyo, Japan': [139.6917, 35.6895],
      'Sydney, Australia': [151.2093, -33.8688],
      'Singapore': [103.8198, 1.3521],
      'Dubai, UAE': [55.2708, 25.2048],
      'Mumbai, India': [72.8777, 19.0760]
    };
    
    const result = locations.map(loc => {
      const coords = locationCoordinates[loc.location] || [0, 0];
      return {
        location: loc.location,
        coordinates: coords,
        userCount: loc.user_count,
        activeUsers: loc.active_users
      };
    }).filter(loc => loc.coordinates[0] !== 0 || loc.coordinates[1] !== 0);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
