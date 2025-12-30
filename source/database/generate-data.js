import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[randomInt(0, array.length - 1)];
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDateTime(date) {
  return date.toISOString().replace('T', ' ').split('.')[0];
}

// Generate realistic data
const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria', 'William', 'Jennifer', 'Richard', 'Linda', 'Joseph', 'Patricia', 'Thomas', 'Barbara', 'Charles', 'Elizabeth', 'Daniel', 'Susan', 'Matthew', 'Jessica', 'Anthony', 'Karen', 'Mark', 'Nancy', 'Donald', 'Betty', 'Steven', 'Helen', 'Paul', 'Sandra', 'Andrew', 'Donna', 'Joshua', 'Carol', 'Kenneth', 'Ruth', 'Kevin', 'Sharon', 'Brian', 'Michelle', 'George', 'Laura', 'Edward', 'Amy', 'Ronald', 'Shirley'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'];
const companies = ['TechCorp', 'DataSystems', 'CloudVentures', 'InnovateLabs', 'DigitalWorks', 'SmartSolutions', 'NextGen Tech', 'WebDynamics', 'AppBuilders', 'CodeFactory', 'DevMasters', 'SoftwarePros', 'TechNova', 'ByteCraft', 'PixelPerfect', 'CloudScale', 'DataDrive', 'NetWorks', 'SysAdmin Inc', 'DevOps Solutions'];

const subscriptionTiers = ['free', 'starter', 'professional', 'enterprise'];
const churnStatuses = ['active', 'active', 'active', 'active', 'active', 'at_risk', 'churned']; // Weight towards active
const transactionTypes = ['mrr', 'one_time', 'refund'];
const transactionStatuses = ['completed', 'completed', 'completed', 'pending', 'failed']; // Weight towards completed
const acquisitionChannels = ['organic', 'paid_search', 'social_media', 'email', 'referral', 'direct'];
const funnelStages = ['awareness', 'consideration', 'conversion', 'retention'];
const campaignNames = ['Summer Sale 2024', 'Q4 Growth', 'Product Launch', 'Referral Program', 'Holiday Special', 'Brand Awareness', 'Lead Gen Campaign', 'Retargeting Q1', 'Email Nurture', 'Social Media Push', 'Content Marketing', 'Partnership Drive'];
const features = ['dashboard', 'reports', 'api', 'integrations', 'analytics', 'export', 'collaboration', 'automation', 'notifications', 'search'];

// Tier pricing
const tierPricing = {
  free: 0,
  starter: 29,
  professional: 99,
  enterprise: 299
};

console.log('Generating realistic SaaS data...\n');

// Generate 600 users
console.log('Generating users data...');
const users = [];
const startDate = new Date('2023-01-01');
const endDate = new Date('2025-12-01');

for (let i = 1; i <= 600; i++) {
  const firstName = randomChoice(firstNames);
  const lastName = randomChoice(lastNames);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@example.com`;
  const name = `${firstName} ${lastName}`;
  const signupDate = randomDate(startDate, endDate);
  const subscriptionTier = randomChoice(subscriptionTiers);
  const churnStatus = randomChoice(churnStatuses);
  
  users.push({
    id: i,
    email,
    name,
    signup_date: formatDateTime(signupDate),
    subscription_tier: subscriptionTier,
    churn_status: churnStatus
  });
}

// Write users CSV
const usersCSV = [
  'id,email,name,signup_date,subscription_tier,churn_status',
  ...users.map(u => `${u.id},"${u.email}","${u.name}","${u.signup_date}",${u.subscription_tier},${u.churn_status}`)
].join('\n');

writeFileSync(join(__dirname, '../../input/users.csv'), usersCSV);
console.log(`✓ Generated ${users.length} users`);

// Generate revenue data (2-5 transactions per user on average = ~1800 records)
console.log('Generating revenue data...');
const revenue = [];
let revenueId = 1;

users.forEach(user => {
  const signupDate = new Date(user.signup_date);
  const numTransactions = user.churn_status === 'churned' ? randomInt(1, 3) : randomInt(2, 8);
  
  for (let i = 0; i < numTransactions; i++) {
    const transactionDate = randomDate(signupDate, endDate);
    let transactionType = randomChoice(transactionTypes);
    let amount;
    
    // Free users only have occasional one-time purchases
    if (user.subscription_tier === 'free') {
      transactionType = Math.random() > 0.9 ? 'one_time' : 'mrr';
      amount = transactionType === 'one_time' ? randomInt(5, 50) : 0;
    } else {
      if (transactionType === 'mrr') {
        amount = tierPricing[user.subscription_tier];
      } else if (transactionType === 'one_time') {
        amount = randomInt(10, 500);
      } else {
        amount = -randomInt(10, tierPricing[user.subscription_tier] || 50);
      }
    }
    
    const status = randomChoice(transactionStatuses);
    
    revenue.push({
      id: revenueId++,
      user_id: user.id,
      transaction_date: formatDateTime(transactionDate),
      transaction_type: transactionType,
      amount: amount.toFixed(2),
      subscription_tier: user.subscription_tier,
      status
    });
  }
});

const revenueCSV = [
  'id,user_id,transaction_date,transaction_type,amount,subscription_tier,status',
  ...revenue.map(r => `${r.id},${r.user_id},"${r.transaction_date}",${r.transaction_type},${r.amount},${r.subscription_tier},${r.status}`)
].join('\n');

writeFileSync(join(__dirname, '../../input/revenue.csv'), revenueCSV);
console.log(`✓ Generated ${revenue.length} revenue records`);

// Generate usage metrics (1-4 records per user = ~1500 records)
console.log('Generating usage metrics data...');
const usageMetrics = [];
let usageId = 1;

users.forEach(user => {
  const signupDate = new Date(user.signup_date);
  const numRecords = user.churn_status === 'churned' ? randomInt(1, 3) : randomInt(2, 6);
  
  for (let i = 0; i < numRecords; i++) {
    const metricDate = randomDate(signupDate, endDate);
    const loginCount = user.churn_status === 'active' ? randomInt(1, 50) : randomInt(0, 5);
    const featuresUsed = [];
    const featuresCount = randomInt(1, 7);
    
    for (let j = 0; j < featuresCount; j++) {
      featuresUsed.push(randomChoice(features));
    }
    
    const supportTicketsOpened = randomInt(0, 5);
    const supportTicketsResolved = supportTicketsOpened > 0 ? randomInt(0, supportTicketsOpened) : 0;
    const sessionDuration = user.churn_status === 'active' ? (randomInt(5, 180)).toFixed(1) : (randomInt(1, 30)).toFixed(1);
    
    usageMetrics.push({
      id: usageId++,
      user_id: user.id,
      metric_date: formatDate(metricDate),
      login_count: loginCount,
      feature_usage: featuresUsed.join(','),
      features_used_count: featuresCount,
      support_tickets_opened: supportTicketsOpened,
      support_tickets_resolved: supportTicketsResolved,
      session_duration_minutes: sessionDuration
    });
  }
});

const usageMetricsCSV = [
  'id,user_id,metric_date,login_count,feature_usage,features_used_count,support_tickets_opened,support_tickets_resolved,session_duration_minutes',
  ...usageMetrics.map(u => `${u.id},${u.user_id},${u.metric_date},${u.login_count},"${u.feature_usage}",${u.features_used_count},${u.support_tickets_opened},${u.support_tickets_resolved},${u.session_duration_minutes}`)
].join('\n');

writeFileSync(join(__dirname, '../../input/usage_metrics.csv'), usageMetricsCSV);
console.log(`✓ Generated ${usageMetrics.length} usage metrics records`);

// Generate marketing data (1-3 records per user = ~1200 records)
console.log('Generating marketing data...');
const marketing = [];
let marketingId = 1;

users.forEach(user => {
  const signupDate = new Date(user.signup_date);
  const numCampaigns = randomInt(1, 3);
  
  for (let i = 0; i < numCampaigns; i++) {
    // Campaign date should be before or around signup
    const campaignDate = new Date(signupDate.getTime() - randomInt(0, 30) * 24 * 60 * 60 * 1000);
    const campaign = randomChoice(campaignNames);
    const channel = randomChoice(acquisitionChannels);
    const funnel = randomChoice(funnelStages);
    const impressions = randomInt(100, 10000);
    const clicks = Math.floor(impressions * (randomInt(1, 15) / 100));
    const conversions = funnel === 'conversion' ? randomInt(0, Math.max(1, Math.floor(clicks * 0.2))) : 0;
    const cost = (randomInt(50, 5000) / 10).toFixed(2);
    const conversionValue = conversions > 0 ? (randomInt(29, 500)).toFixed(2) : '0.00';
    
    marketing.push({
      id: marketingId++,
      user_id: user.id,
      campaign_name: campaign,
      acquisition_channel: channel,
      campaign_date: formatDate(campaignDate),
      funnel_stage: funnel,
      conversion_value: conversionValue,
      cost: cost,
      impressions,
      clicks,
      conversions
    });
  }
});

const marketingCSV = [
  'id,user_id,campaign_name,acquisition_channel,campaign_date,funnel_stage,conversion_value,cost,impressions,clicks,conversions',
  ...marketing.map(m => `${m.id},${m.user_id},"${m.campaign_name}",${m.acquisition_channel},${m.campaign_date},${m.funnel_stage},${m.conversion_value},${m.cost},${m.impressions},${m.clicks},${m.conversions}`)
].join('\n');

writeFileSync(join(__dirname, '../../input/marketing.csv'), marketingCSV);
console.log(`✓ Generated ${marketing.length} marketing records`);

console.log('\n✅ Data generation complete!');
console.log('\nSummary:');
console.log(`  - users.csv: ${users.length} records`);
console.log(`  - revenue.csv: ${revenue.length} records`);
console.log(`  - usage_metrics.csv: ${usageMetrics.length} records`);
console.log(`  - marketing.csv: ${marketing.length} records`);
console.log(`\nTotal: ${users.length + revenue.length + usageMetrics.length + marketing.length} records`);
console.log('\nFiles saved to: Interview/input/');
