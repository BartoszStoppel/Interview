import db from './connection.js';

/**
 * Initialize the analytics database schema
 * This will create 4 tables for the SaaS analytics dashboard:
 * 1. users - Signup dates, subscription tiers, and churn status
 * 2. revenue - Monthly recurring revenue, one-time payments, and refunds
 * 3. usage_metrics - Login frequency, feature usage, and support tickets
 * 4. marketing - Campaign performance, conversion funnels, and acquisition channels
 */

function initDatabase() {
  console.log('Initializing database schema...\n');

  // Drop existing tables if they exist (for development)
  db.exec(`
    DROP TABLE IF EXISTS marketing;
    DROP TABLE IF EXISTS usage_metrics;
    DROP TABLE IF EXISTS revenue;
    DROP TABLE IF EXISTS users;
  `);

  // Table 1: Users (500+ users with signup dates, subscription tiers, and churn status)
  db.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      signup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      subscription_tier TEXT CHECK(subscription_tier IN ('free', 'starter', 'professional', 'enterprise')) DEFAULT 'free',
      churn_status TEXT CHECK(churn_status IN ('active', 'at_risk', 'churned')) DEFAULT 'active'
    )
  `);
  console.log('✓ Created table: users');

  // Table 2: Revenue (Monthly recurring revenue, one-time payments, and refunds)
  db.exec(`
    CREATE TABLE revenue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      transaction_type TEXT CHECK(transaction_type IN ('mrr', 'one_time', 'refund')) NOT NULL,
      amount REAL NOT NULL,
      subscription_tier TEXT CHECK(subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
      status TEXT CHECK(status IN ('completed', 'pending', 'failed')) DEFAULT 'completed',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ Created table: revenue');

  // Table 3: Usage Metrics (Login frequency, feature usage, and support tickets)
  db.exec(`
    CREATE TABLE usage_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      metric_date DATE NOT NULL,
      login_count INTEGER DEFAULT 0,
      feature_usage TEXT,
      features_used_count INTEGER DEFAULT 0,
      support_tickets_opened INTEGER DEFAULT 0,
      support_tickets_resolved INTEGER DEFAULT 0,
      session_duration_minutes REAL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
  console.log('✓ Created table: usage_metrics');

  // Table 4: Marketing (Campaign performance, conversion funnels, and acquisition channels)
  db.exec(`
    CREATE TABLE marketing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      campaign_name TEXT NOT NULL,
      acquisition_channel TEXT CHECK(acquisition_channel IN ('organic', 'paid_search', 'social_media', 'email', 'referral', 'direct')) NOT NULL,
      campaign_date DATE NOT NULL,
      funnel_stage TEXT CHECK(funnel_stage IN ('awareness', 'consideration', 'conversion', 'retention')) NOT NULL,
      conversion_value REAL DEFAULT 0,
      cost REAL DEFAULT 0,
      impressions INTEGER DEFAULT 0,
      clicks INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
  console.log('✓ Created table: marketing');

  // Create indexes for better query performance
  db.exec(`
    CREATE INDEX idx_users_signup ON users(signup_date);
    CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
    CREATE INDEX idx_users_churn ON users(churn_status);
    CREATE INDEX idx_revenue_user ON revenue(user_id);
    CREATE INDEX idx_revenue_date ON revenue(transaction_date);
    CREATE INDEX idx_revenue_type ON revenue(transaction_type);
    CREATE INDEX idx_usage_user ON usage_metrics(user_id);
    CREATE INDEX idx_usage_date ON usage_metrics(metric_date);
    CREATE INDEX idx_marketing_channel ON marketing(acquisition_channel);
    CREATE INDEX idx_marketing_campaign ON marketing(campaign_name);
    CREATE INDEX idx_marketing_date ON marketing(campaign_date);
    CREATE INDEX idx_marketing_funnel ON marketing(funnel_stage);
  `);
  console.log('✓ Created indexes for performance');

  console.log('\n✅ Database initialization complete!');
  console.log('\nTables created:');
  console.log('  - users (signup dates, subscription tiers, and churn status)');
  console.log('  - revenue (MRR, one-time payments, and refunds)');
  console.log('  - usage_metrics (login frequency, feature usage, support tickets)');
  console.log('  - marketing (campaign performance, conversion funnels, acquisition channels)');
}

// Run initialization
try {
  initDatabase();
} catch (error) {
  console.error('❌ Database initialization failed:', error);
  process.exit(1);
}

// Close database connection
db.close();
