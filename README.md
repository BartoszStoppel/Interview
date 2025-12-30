# SaaS Analytics Dashboard

A full-stack analytics dashboard built with React, Node.js/Express, and SQLite to visualize key metrics for a fictional SaaS company.

## 🎯 Project Overview

This project demonstrates a complete analytics solution featuring:
- **600+ users** across multiple subscription tiers (Free, Starter, Professional, Enterprise)
- **Real-time KPI tracking** including MRR, user growth, churn rate, and customer lifetime value
- **Multi-dimensional analytics** covering revenue, usage patterns, and marketing performance
- **Interactive visualizations** using Recharts for data exploration

## 🏗️ Architecture

**Frontend**: React 18 + Vite + TanStack Query + Recharts  
**Backend**: Node.js + Express REST API  
**Database**: SQLite with better-sqlite3  
**Data**: 4000+ records across 4 normalized tables

## 📊 Features

### Dashboard Views
- **Overview** - High-level KPIs and trend charts
- **Users** - Customer segmentation by tier and churn status
- **Revenue** - MRR tracking, transaction history, revenue trends
- **Usage** - Feature adoption, login frequency, support metrics
- **Marketing** - Campaign ROI, conversion funnels, channel analysis

### Database Schema
- `users` - 600 customers with signup dates, tiers, churn status
- `revenue` - Transaction records (MRR, one-time, refunds)
- `usage_metrics` - Daily usage stats and support tickets
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

### Dashboard
- `GET /api/dashboard/kpis` - Overall metrics
- `GET /api/dashboard/user-growth` - Growth over time

### Users
- `GET /api/users` - Paginated user list
- `GET /api/users/stats/summary` - User statistics

### Revenue
- `GET /api/revenue` - Transaction history
- `GET /api/revenue/stats/summary` - Revenue totals
- `GET /api/revenue/stats/monthly` - Monthly trends

### Usage
- `GET /api/usage` - Usage metrics
- `GET /api/usage/stats/summary` - Engagement stats

### Marketing
- `GET /api/marketing` - Campaign data
- `GET /api/marketing/stats/summary` - Marketing metrics
- `GET /api/marketing/stats/campaigns` - Performance by campaign

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router |
| Data Fetching | TanStack Query (React Query), Axios |
| Visualization | Recharts |
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
- User signups spanning 2023-2025
- Monthly recurring revenue with multiple pricing tiers
- Feature usage patterns and support ticket data
- Multi-channel marketing attribution

## 🔮 Future Enhancements

- [ ] Real-time data streaming with WebSockets
- [ ] Advanced filtering and date range selection
- [ ] Export functionality (CSV, PDF reports)
- [ ] User cohort analysis
- [ ] Predictive churn modeling
- [ ] A/B test result tracking

## 📄 License

MIT
