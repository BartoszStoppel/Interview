# API Documentation

## Base URL
```
http://localhost:3001/api
```

## Response Format
All endpoints return JSON responses with the following structure:

**Success Response:**
```json
{
  "data": [...] or {...}
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```

---

## Dashboard Endpoints

### GET /dashboard/kpis
Returns overall key performance indicators for the SaaS platform.

**Response:**
```json
{
  "users": {
    "total": 600,
    "active": 480,
    "churned": 120,
    "newLast30Days": 45,
    "churnRate": 20.0
  },
  "revenue": {
    "totalMRR": 125000,
    "averageRevenuePerUser": 208.33
  }
}
```

---

### GET /dashboard/user-growth
Returns monthly user growth metrics including new signups and cumulative totals.

**Response:**
```json
[
  {
    "month": "2023-01",
    "new_users": 50,
    "cumulative_users": 50
  },
  {
    "month": "2023-02",
    "new_users": 45,
    "cumulative_users": 95
  }
]
```

---

### GET /dashboard/revenue-trends
Returns monthly revenue breakdown by transaction type.

**Response:**
```json
[
  {
    "month": "2024-01",
    "mrr": 85000,
    "one_time": 15000,
    "refunds": 2500
  }
]
```

---

### GET /dashboard/acquisition-funnel
Returns marketing funnel metrics by stage and channel.

**Response:**
```json
[
  {
    "funnel_stage": "awareness",
    "impressions": 500000,
    "clicks": 25000,
    "conversions": 1250
  },
  {
    "funnel_stage": "consideration",
    "impressions": 150000,
    "clicks": 15000,
    "conversions": 900
  }
]
```

---

### GET /dashboard/churn-cohorts
Returns cohort retention analysis showing percentage of active users by months since signup.

**Response:**
```json
[
  {
    "cohort": "2024-01",
    "month_0": 50,
    "month_1": 85,
    "month_2": 72,
    "month_3": 68,
    "month_4": 64,
    "month_5": 62,
    "month_6": 60
  }
]
```

**Notes:**
- `cohort`: Signup month
- `month_0`: Initial cohort size
- `month_1-6`: Retention percentage for that month
- `null` values indicate future months that haven't occurred yet

---

### GET /dashboard/feature-usage
Returns feature usage counts aggregated by subscription tier.

**Response:**
```json
[
  {
    "feature": "dashboard",
    "free": 150,
    "starter": 200,
    "professional": 180,
    "enterprise": 50
  },
  {
    "feature": "analytics",
    "free": 50,
    "starter": 180,
    "professional": 200,
    "enterprise": 60
  }
]
```

---

### GET /dashboard/user-locations
Returns user distribution by location with geographic coordinates.

**Response:**
```json
[
  {
    "location": "New York, NY",
    "coordinates": [-74.0060, 40.7128],
    "userCount": 85,
    "activeUsers": 68
  },
  {
    "location": "London, UK",
    "coordinates": [-0.1276, 51.5074],
    "userCount": 42,
    "activeUsers": 35
  }
]
```

---

## User Endpoints

### GET /users
Returns paginated list of users with optional filters.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 50 | Items per page |
| tier | string | - | Filter by subscription tier (free, starter, professional, enterprise) |
| status | string | - | Filter by churn status (active, churned) |
| location | string | - | Filter by location (exact match) |
| startDate | string (YYYY-MM-DD) | - | Filter users after this signup date |
| endDate | string (YYYY-MM-DD) | - | Filter users before this signup date |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "email": "user1@example.com",
      "name": "John Doe",
      "location": "New York, NY",
      "signup_date": "2024-01-15",
      "subscription_tier": "professional",
      "churn_status": "active"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 600,
    "totalPages": 12
  }
}
```

---

### GET /users/stats/summary
Returns user statistics summary.

**Response:**
```json
{
  "total_users": 600,
  "active_users": 480,
  "churned_users": 120,
  "churn_rate": 20.0,
  "by_tier": {
    "free": 150,
    "starter": 200,
    "professional": 180,
    "enterprise": 70
  }
}
```

---

## Revenue Endpoints

### GET /revenue
Returns paginated transaction history with optional filters.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 50 | Items per page |
| type | string | - | Filter by transaction type (mrr, one_time, refund) |
| minAmount | number | - | Minimum transaction amount |
| maxAmount | number | - | Maximum transaction amount |
| startDate | string (YYYY-MM-DD) | - | Filter transactions after this date |
| endDate | string (YYYY-MM-DD) | - | Filter transactions before this date |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "transaction_date": "2024-01-15",
      "amount": 99.00,
      "transaction_type": "mrr"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1500,
    "totalPages": 30
  }
}
```

---

### GET /revenue/stats/summary
Returns revenue statistics summary.

**Response:**
```json
{
  "total_revenue": 450000,
  "total_mrr": 125000,
  "total_refunds": 8500,
  "average_transaction": 300
}
```

---

### GET /revenue/stats/monthly
Returns monthly revenue breakdown including refunds.

**Response:**
```json
[
  {
    "month": "2024-01",
    "total_revenue": 100000,
    "mrr": 85000,
    "one_time": 18000,
    "refunds": 3000
  }
]
```

---

## Usage Endpoints

### GET /usage
Returns paginated usage metrics with optional filters.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 50 | Items per page |
| minLogins | integer | - | Minimum login count |
| maxLogins | integer | - | Maximum login count |
| startDate | string (YYYY-MM-DD) | - | Filter metrics after this date |
| endDate | string (YYYY-MM-DD) | - | Filter metrics before this date |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 5,
      "metric_date": "2024-01-15",
      "login_count": 12,
      "feature_usage": "dashboard,analytics,reports",
      "support_tickets": 1
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 2500,
    "totalPages": 50
  }
}
```

---

### GET /usage/stats/summary
Returns usage statistics summary.

**Response:**
```json
{
  "total_logins": 25000,
  "average_logins_per_user": 41.67,
  "total_support_tickets": 450,
  "most_used_features": ["dashboard", "analytics", "reports"]
}
```

---

## Marketing Endpoints

### GET /marketing
Returns paginated marketing campaign data with optional filters.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 50 | Items per page |
| channel | string | - | Filter by channel (google_ads, facebook, email, etc.) |
| minSpend | number | - | Minimum spend amount |
| maxSpend | number | - | Maximum spend amount |
| startDate | string (YYYY-MM-DD) | - | Filter campaigns after this date |
| endDate | string (YYYY-MM-DD) | - | Filter campaigns before this date |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "campaign_date": "2024-01-15",
      "channel": "google_ads",
      "campaign_name": "Q1 Growth Campaign",
      "spend": 5000,
      "impressions": 100000,
      "clicks": 5000,
      "conversions": 250
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 800,
    "totalPages": 16
  }
}
```

---

### GET /marketing/stats/summary
Returns marketing statistics summary.

**Response:**
```json
{
  "total_spend": 125000,
  "total_conversions": 2500,
  "average_cpa": 50.00,
  "total_impressions": 5000000,
  "total_clicks": 250000
}
```

---

### GET /marketing/stats/campaigns
Returns campaign performance grouped by campaign name.

**Response:**
```json
[
  {
    "campaign_name": "Q1 Growth Campaign",
    "total_spend": 25000,
    "total_conversions": 500,
    "total_impressions": 1000000,
    "total_clicks": 50000,
    "cpa": 50.00,
    "ctr": 5.0
  }
]
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Database or server error |

---

## Rate Limiting

Currently, there are no rate limits implemented. This is a development/demo application.

---

## Authentication

Currently, there is no authentication required. This is a demo application with sample data.

---

## CORS

The API accepts requests from all origins in development mode. In production, configure the CORS middleware in `source/api/server.js` to restrict origins.
