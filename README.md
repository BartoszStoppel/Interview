# SaaS Analytics Dashboard

A full-stack analytics dashboard built with React, Node.js/Express, and SQLite to visualize key metrics for a fictional SaaS company.

## 🎯 Project Overview

This project demonstrates a complete analytics solution featuring:
- **600+ users** across 35 global locations and multiple subscription tiers (Free, Starter, Professional, Enterprise)
- **Real-time KPI tracking** including MRR, user growth, churn rate, and active users
- **Advanced analytics** with cohort retention analysis, feature usage heatmaps, and geographic distribution
- **Interactive visualizations** using Recharts and React Simple Maps
- **Comprehensive filtering** on all data views with apply-on-demand pattern
- **World map visualization** showing user distribution across global cities

## 🏗️ Architecture

**Frontend**: React 18 + Vite + TanStack Query + Recharts + React Simple Maps  
**Backend**: Node.js + Express REST API with auto-restart on port conflicts  
**Database**: SQLite with better-sqlite3 (12 indexes for performance)  
**Data**: 4000+ records across 4 normalized tables with location tracking

## 📊 Features

### Dashboard Views
- **Overview** - 7 visualization sections:
  - KPI cards (Total Users, Active Users, MRR, Churn Rate)
  - User Growth trends (new users + cumulative)
  - User Acquisition Funnel (impressions → clicks → conversions)
  - Geographic Distribution (world map with bubble markers)
  - Cohort Retention Analysis (time-series retention percentages)
  - Feature Usage Heatmap (by subscription tier)
  - Monthly Revenue Breakdown (revenue, MRR, refunds)
- **Users** - Customer list with advanced filters (tier, status, location, date range)
- **Revenue** - Transaction history with filters (type, amount, date)
- **Usage** - Feature adoption and login patterns with filters
- **Marketing** - Campaign ROI and channel analysis with filters

### Database Schema
- `users` - 600 customers with signup dates, tiers, churn status, and global locations (35 cities)
- `revenue` - Transaction records (MRR, one-time, refunds)
- `usage_metrics` - Daily usage stats, feature usage, and support tickets
- `marketing` - Campaign performance and attribution data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Initialize database and generate sample data
npm run setup-db
```

### Development

```bash
# Start API server (http://localhost:3001)
npm run dev:api

# Start frontend (http://localhost:5173) - in a new terminal
npm run dev:frontend
```

### Production Build

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
Interview/
├── input/                    # Generated CSV data files
├── source/
│   ├── api/                  # Express server
│   │   └── server.js
│   ├── routes/               # API endpoints
│   │   ├── dashboard.js      # KPIs & aggregations
│   │   ├── users.js
│   │   ├── revenue.js
│   │   ├── usage.js
│   │   └── marketing.js
│   ├── database/             # SQLite setup
│   │   ├── connection.js
│   │   ├── init-db.js        # Schema creation
│   │   ├── generate-data.js  # Sample data generator
│   │   └── load-data.js      # CSV import
│   ├── pages/                # React views
│   ├── components/           # Reusable UI components
│   ├── services/             # API client
│   └── vite.config.js
└── package.json
```

## 🔌 API Endpoints

### Dashboard Analytics
- `GET /api/dashboard/kpis` - Overall metrics (users, revenue, churn)
- `GET /api/dashboard/user-growth` - Monthly growth trends
- `GET /api/dashboard/revenue-trends` - Revenue by type over time
- `GET /api/dashboard/acquisition-funnel` - Marketing funnel metrics
- `GET /api/dashboard/churn-cohorts` - Cohort retention analysis (% active by month)
- `GET /api/dashboard/feature-usage` - Feature usage heatmap data (by tier)
- `GET /api/dashboard/user-locations` - Geographic distribution with coordinates

### Users
- `GET /api/users` - Paginated user list with filters
  - Query params: `page`, `limit`, `tier`, `status`, `location`, `startDate`, `endDate`
- `GET /api/users/stats/summary` - User statistics

### Revenue
- `GET /api/revenue` - Transaction history with filters
  - Query params: `page`, `limit`, `type`, `minAmount`, `maxAmount`, `startDate`, `endDate`
- `GET /api/revenue/stats/summary` - Revenue totals
- `GET /api/revenue/stats/monthly` - Monthly trends with refunds

### Usage
- `GET /api/usage` - Usage metrics with filters
  - Query params: `page`, `limit`, `minLogins`, `maxLogins`, `startDate`, `endDate`
- `GET /api/usage/stats/summary` - Engagement stats

### Marketing
- `GET /api/marketing` - Campaign data with filters
  - Query params: `page`, `limit`, `channel`, `minSpend`, `maxSpend`, `startDate`, `endDate`
- `GET /api/marketing/stats/summary` - Marketing metrics
- `GET /api/marketing/stats/campaigns` - Performance by campaign

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router |
| Data Fetching | TanStack Query (React Query), Axios |
| Visualization | Recharts, React Simple Maps |
| Backend | Node.js, Express, CORS |
| Database | SQLite (better-sqlite3) |
| Dev Tools | Vite, ESLint |

## 📝 Scripts

```bash
npm run init-db          # Create database schema
npm run generate-data    # Generate sample CSV data
npm run load-data        # Import CSV into database
npm run setup-db         # Complete database setup (all 3 above)
npm run dev:api          # Start API server
npm run dev:frontend     # Start Vite dev server
npm run build            # Production build
```

## 📈 Sample Data

The database includes realistic SaaS metrics:
- User signups spanning 2023-2025 across 35 global cities (US, Canada, International)
- Monthly recurring revenue with multiple pricing tiers
- Feature usage patterns and support ticket data
- Multi-channel marketing attribution
- Geographic distribution: New York, LA, Toronto, London, Paris, Tokyo, Singapore, and more

## 🔮 Future Enhancements

- [x] Cohort retention analysis
- [x] Advanced filtering with apply-on-demand pattern
- [x] Geographic visualization with world map
- [x] Feature usage heatmaps
- [ ] Real-time data streaming with WebSockets
- [ ] Export functionality (CSV, PDF reports)
- [ ] Predictive churn modeling with ML
- [ ] A/B test result tracking
- [ ] Custom date range selection with date pickers
- [ ] User drill-down views

## 📄 License

MIT
