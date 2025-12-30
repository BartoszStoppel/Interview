# Database Schema

## Overview

The analytics dashboard uses SQLite with 4 normalized tables to track SaaS metrics. The database is optimized with 12 indexes for query performance.

---

## Tables

### users
Stores customer account information and subscription details.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location TEXT,
  signup_date DATE NOT NULL,
  subscription_tier TEXT CHECK(subscription_tier IN ('free', 'starter', 'professional', 'enterprise')),
  churn_status TEXT CHECK(churn_status IN ('active', 'churned'))
)
```

**Columns:**
- `id` - Unique user identifier
- `email` - User email address (unique)
- `name` - User full name
- `location` - City and country/state (e.g., "New York, NY")
- `signup_date` - Account creation date (YYYY-MM-DD)
- `subscription_tier` - Current subscription level
- `churn_status` - Whether user is active or churned

**Indexes:**
- `idx_users_tier` on `subscription_tier`
- `idx_users_churn` on `churn_status`
- `idx_users_signup` on `signup_date`
- `idx_users_location` on `location`

**Sample Data:**
- 600 users
- Signup dates: 2023-01-01 to 2025-12-31
- 35 global locations (US cities, Canadian cities, International)
- Tier distribution: ~25% each tier
- Churn rate: ~20%

---

### revenue
Tracks all financial transactions including recurring revenue, one-time purchases, and refunds.

```sql
CREATE TABLE revenue (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  transaction_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type TEXT CHECK(transaction_type IN ('mrr', 'one_time', 'refund')),
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

**Columns:**
- `id` - Unique transaction identifier
- `user_id` - Reference to users table
- `transaction_date` - When transaction occurred
- `amount` - Transaction amount (negative for refunds)
- `transaction_type` - Category of transaction

**Indexes:**
- `idx_revenue_user` on `user_id`
- `idx_revenue_date` on `transaction_date`
- `idx_revenue_type` on `transaction_type`

**Sample Data:**
- ~1,500 transactions
- Amount range: $9.99 to $999.99
- Date range: 2023-01-01 to 2025-12-31
- MRR transactions: Monthly for active users
- Refunds: Negative amounts (~5% of transactions)

**Business Logic:**
- MRR: Recurring monthly charges based on subscription tier
  - Free: $0
  - Starter: $29-49/month
  - Professional: $99-199/month
  - Enterprise: $499-999/month
- One-time: Setup fees, upgrades, add-ons
- Refunds: Customer refunds (stored as negative amounts)

---

### usage_metrics
Tracks daily user engagement and feature usage patterns.

```sql
CREATE TABLE usage_metrics (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  metric_date DATE NOT NULL,
  login_count INTEGER DEFAULT 0,
  feature_usage TEXT,
  support_tickets INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

**Columns:**
- `id` - Unique metric record identifier
- `user_id` - Reference to users table
- `metric_date` - Date of metrics
- `login_count` - Number of logins that day
- `feature_usage` - Comma-separated list of features used (e.g., "dashboard,analytics,reports")
- `support_tickets` - Number of support tickets opened

**Indexes:**
- `idx_usage_user` on `user_id`
- `idx_usage_date` on `metric_date`

**Sample Data:**
- ~2,000 metric records
- Login counts: 0-25 per day
- Features: dashboard, analytics, reports, integrations, api, exports, team, admin
- Support tickets: 0-3 per day
- Date range: 2023-01-01 to 2025-12-31

**Analysis Use Cases:**
- Feature adoption rates by tier
- Daily active users (DAU)
- Support load by user segment
- Engagement patterns over time

---

### marketing
Stores marketing campaign performance data across multiple channels.

```sql
CREATE TABLE marketing (
  id INTEGER PRIMARY KEY,
  campaign_date DATE NOT NULL,
  channel TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  spend DECIMAL(10, 2) NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0
)
```

**Columns:**
- `id` - Unique campaign record identifier
- `campaign_date` - Date of campaign activity
- `channel` - Marketing channel (google_ads, facebook, email, organic, linkedin, twitter, referral, partner)
- `campaign_name` - Campaign identifier
- `spend` - Marketing spend for that day/campaign
- `impressions` - Ad impressions
- `clicks` - Click-through count
- `conversions` - Successful conversions (signups)

**Indexes:**
- `idx_marketing_date` on `campaign_date`
- `idx_marketing_channel` on `channel`

**Sample Data:**
- ~800 campaign records
- Channels: 8 different types
- Spend range: $100 to $10,000 per campaign
- Date range: 2023-01-01 to 2025-12-31
- CTR (Click-Through Rate): 2-10%
- Conversion Rate: 2-5% of clicks

**Calculated Metrics:**
- CPA (Cost Per Acquisition): `spend / conversions`
- CTR (Click-Through Rate): `(clicks / impressions) * 100`
- Conversion Rate: `(conversions / clicks) * 100`
- ROAS (Return on Ad Spend): Requires joining with revenue data

---

## Relationships

```
users (1) ──< revenue (many)
users (1) ──< usage_metrics (many)
```

Marketing is not directly linked to users but can be analyzed alongside user signup dates for attribution analysis.

---

## Data Generation

Data is generated using `source/database/generate-data.js` which:
1. Creates realistic user profiles with global locations
2. Generates monthly MRR transactions for active users
3. Simulates daily usage patterns based on subscription tier
4. Creates multi-channel marketing campaigns with realistic performance

**Locations (35 cities):**
- **US Cities (24):** New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, San Antonio, San Diego, Dallas, San Jose, Austin, Jacksonville, San Francisco, Columbus, Indianapolis, Seattle, Denver, Boston, Portland, Nashville, Atlanta, Miami, Detroit, Minneapolis
- **Canadian Cities (3):** Toronto, Vancouver, Montreal
- **International (8):** London, Paris, Berlin, Tokyo, Sydney, Singapore, Dubai, Mumbai

---

## Query Performance

**Indexes provide optimized performance for:**
- Filtering by subscription tier, churn status, location
- Date range queries on all tables
- User-specific transaction and usage history
- Channel-based marketing analysis

**Common Query Patterns:**
```sql
-- Active users by tier
SELECT subscription_tier, COUNT(*) 
FROM users 
WHERE churn_status = 'active' 
GROUP BY subscription_tier;

-- Monthly recurring revenue
SELECT strftime('%Y-%m', transaction_date) as month, 
       SUM(amount) as mrr
FROM revenue 
WHERE transaction_type = 'mrr' 
GROUP BY month;

-- Feature usage by tier
SELECT u.subscription_tier, 
       um.feature_usage, 
       COUNT(*) as usage_count
FROM usage_metrics um
JOIN users u ON um.user_id = u.id
GROUP BY u.subscription_tier, um.feature_usage;

-- Campaign ROI
SELECT channel,
       SUM(spend) as total_spend,
       SUM(conversions) as total_conversions,
       SUM(spend) / SUM(conversions) as cpa
FROM marketing
GROUP BY channel;
```

---

## Database File

**Location:** `Interview/database.db`  
**Size:** ~500 KB  
**Engine:** SQLite 3  
**Driver:** better-sqlite3 (synchronous Node.js driver)

---

## Maintenance

**Reset Database:**
```bash
npm run setup-db
```

This will:
1. Drop and recreate all tables
2. Generate fresh sample data
3. Import data from CSV files
4. Rebuild all indexes

**Individual Steps:**
```bash
npm run init-db         # Schema only
npm run generate-data   # Create CSV files
npm run load-data       # Import CSV to database
```
