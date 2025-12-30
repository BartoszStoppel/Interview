import db from './connection.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load CSV data into the analytics database
 */

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const row = {};
    const values = [];
    let currentValue = '';
    let insideQuotes = false;
    
    // Parse CSV line handling quoted values
    for (let char of lines[i]) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    
    // Map values to headers
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

function loadData() {
  console.log('Loading data into database...\n');
  
  try {
    // Begin transaction for better performance
    db.exec('BEGIN TRANSACTION');
    
    // Load users
    console.log('Loading users...');
    const usersCSV = readFileSync(join(__dirname, '../../input/users.csv'), 'utf-8');
    const users = parseCSV(usersCSV);
    
    const insertUser = db.prepare(`
      INSERT INTO users (id, email, name, signup_date, subscription_tier, churn_status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    users.forEach(user => {
      insertUser.run(
        user.id,
        user.email,
        user.name,
        user.signup_date,
        user.subscription_tier,
        user.churn_status
      );
    });
    console.log(`✓ Loaded ${users.length} users`);
    
    // Load revenue
    console.log('Loading revenue...');
    const revenueCSV = readFileSync(join(__dirname, '../../input/revenue.csv'), 'utf-8');
    const revenue = parseCSV(revenueCSV);
    
    const insertRevenue = db.prepare(`
      INSERT INTO revenue (id, user_id, transaction_date, transaction_type, amount, subscription_tier, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    revenue.forEach(rev => {
      insertRevenue.run(
        rev.id,
        rev.user_id,
        rev.transaction_date,
        rev.transaction_type,
        parseFloat(rev.amount),
        rev.subscription_tier,
        rev.status
      );
    });
    console.log(`✓ Loaded ${revenue.length} revenue records`);
    
    // Load usage metrics
    console.log('Loading usage metrics...');
    const usageCSV = readFileSync(join(__dirname, '../../input/usage_metrics.csv'), 'utf-8');
    const usageMetrics = parseCSV(usageCSV);
    
    const insertUsage = db.prepare(`
      INSERT INTO usage_metrics (id, user_id, metric_date, login_count, feature_usage, features_used_count, support_tickets_opened, support_tickets_resolved, session_duration_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    usageMetrics.forEach(usage => {
      insertUsage.run(
        usage.id,
        usage.user_id,
        usage.metric_date,
        parseInt(usage.login_count),
        usage.feature_usage,
        parseInt(usage.features_used_count),
        parseInt(usage.support_tickets_opened),
        parseInt(usage.support_tickets_resolved),
        parseFloat(usage.session_duration_minutes)
      );
    });
    console.log(`✓ Loaded ${usageMetrics.length} usage metrics records`);
    
    // Load marketing
    console.log('Loading marketing...');
    const marketingCSV = readFileSync(join(__dirname, '../../input/marketing.csv'), 'utf-8');
    const marketing = parseCSV(marketingCSV);
    
    const insertMarketing = db.prepare(`
      INSERT INTO marketing (id, user_id, campaign_name, acquisition_channel, campaign_date, funnel_stage, conversion_value, cost, impressions, clicks, conversions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    marketing.forEach(mkt => {
      insertMarketing.run(
        mkt.id,
        mkt.user_id,
        mkt.campaign_name,
        mkt.acquisition_channel,
        mkt.campaign_date,
        mkt.funnel_stage,
        parseFloat(mkt.conversion_value),
        parseFloat(mkt.cost),
        parseInt(mkt.impressions),
        parseInt(mkt.clicks),
        parseInt(mkt.conversions)
      );
    });
    console.log(`✓ Loaded ${marketing.length} marketing records`);
    
    // Commit transaction
    db.exec('COMMIT');
    
    console.log('\n✅ Data loading complete!');
    console.log('\nDatabase summary:');
    
    // Show counts
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const revenueCount = db.prepare('SELECT COUNT(*) as count FROM revenue').get();
    const usageCount = db.prepare('SELECT COUNT(*) as count FROM usage_metrics').get();
    const marketingCount = db.prepare('SELECT COUNT(*) as count FROM marketing').get();
    
    console.log(`  - Users: ${userCount.count}`);
    console.log(`  - Revenue: ${revenueCount.count}`);
    console.log(`  - Usage Metrics: ${usageCount.count}`);
    console.log(`  - Marketing: ${marketingCount.count}`);
    console.log(`  - Total Records: ${userCount.count + revenueCount.count + usageCount.count + marketingCount.count}`);
    
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('❌ Data loading failed:', error.message);
    process.exit(1);
  }
}

// Run data loading
loadData();

// Close database connection
db.close();
