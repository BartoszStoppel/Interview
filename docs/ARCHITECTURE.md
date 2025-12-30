# Architecture Overview

## System Architecture

This is a full-stack web application following a three-tier architecture pattern.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React Application (Port 5173)                         │ │
│  │  - Single Page Application (SPA)                       │ │
│  │  - Client-side routing (React Router)                  │ │
│  │  - State management (TanStack Query)                   │ │
│  │  - Data visualization (Recharts, React Simple Maps)    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express REST API (Port 3001)                          │ │
│  │  - RESTful endpoints                                   │ │
│  │  - Request validation & filtering                      │ │
│  │  - Pagination logic                                    │ │
│  │  - Business logic & aggregations                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SQLite Database (database.db)                         │ │
│  │  - 4 normalized tables                                 │ │
│  │  - 12 performance indexes                              │ │
│  │  - 4,000+ records                                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Hierarchy

```
App.jsx (Root)
├── Router
│   ├── Overview.jsx (Dashboard)
│   │   ├── KPI Cards
│   │   ├── User Growth Chart (LineChart)
│   │   ├── Acquisition Funnel (BarChart)
│   │   ├── World Map (ComposableMap)
│   │   ├── Cohort Table (HTML Table)
│   │   ├── Feature Heatmap (HTML Table)
│   │   └── Revenue Chart (LineChart)
│   │
│   ├── Users.jsx
│   │   ├── Filter Panel
│   │   └── User Table (with pagination)
│   │
│   ├── Revenue.jsx
│   │   ├── Filter Panel
│   │   └── Revenue Table (with pagination)
│   │
│   ├── Usage.jsx
│   │   ├── Filter Panel
│   │   └── Usage Table (with pagination)
│   │
│   └── Marketing.jsx
│       ├── Filter Panel
│       └── Marketing Table (with pagination)
```

### State Management Strategy

**Server State (TanStack Query)**
- API data fetching and caching
- Automatic background refetching
- Loading and error states
- Query invalidation

**Component State (useState)**
- Form inputs (filters, pagination)
- UI state (modals, dropdowns)
- Local temporary data

**URL State (React Router)**
- Current page/route
- Future: Query parameters for filters

---

## Backend Architecture

### API Structure

```
source/api/server.js (Entry Point)
├── Middleware
│   ├── CORS
│   ├── JSON Parser
│   └── Error Handler
│
├── Routes
│   ├── /api/dashboard/* → routes/dashboard.js
│   ├── /api/users/*     → routes/users.js
│   ├── /api/revenue/*   → routes/revenue.js
│   ├── /api/usage/*     → routes/usage.js
│   └── /api/marketing/* → routes/marketing.js
│
└── Database Connection (singleton)
    └── database/connection.js
```

### Request Flow

```
1. Client Request
   ↓
2. Express Middleware (CORS, JSON parsing)
   ↓
3. Route Handler
   ↓
4. Query Parameter Parsing & Validation
   ↓
5. SQL Query Preparation
   ↓
6. Database Execution (better-sqlite3)
   ↓
7. Data Transformation (if needed)
   ↓
8. JSON Response
   ↓
9. Client Receives Data
```

---

## Database Architecture

### Schema Design

**Normalization:** 3NF (Third Normal Form)
- No redundant data
- Foreign keys for relationships
- Atomic values only

**Indexes:** Strategic indexes on:
- Foreign keys (user_id)
- Filter columns (tier, status, channel, type)
- Date columns (all date fields)
- Commonly queried fields (location)

### Data Flow

```
CSV Files (input/)
    ↓
generate-data.js (creates CSVs)
    ↓
load-data.js (imports to SQLite)
    ↓
database.db (persistent storage)
    ↓
API queries (read operations)
    ↓
JSON responses to client
```

---

## Key Design Patterns

### 1. Repository Pattern (Backend)
Each route file acts as a repository for its domain:
- `routes/users.js` - User data access
- `routes/revenue.js` - Revenue data access
- etc.

### 2. Query Object Pattern
Filters passed as query parameters:
```javascript
GET /api/users?tier=professional&status=active&page=2
```

### 3. Apply-on-Demand Pattern (Frontend)
Separate filter state from applied filters:
```javascript
// User types into filters
const [filters, setFilters] = useState({})

// Applied only when button clicked
const [appliedFilters, setAppliedFilters] = useState({})

// Query uses appliedFilters
useQuery(['users', appliedFilters], ...)
```

### 4. Singleton Pattern (Database)
Single database connection reused across all routes:
```javascript
// database/connection.js
let db = null;
export default function getDatabase() {
  if (!db) {
    db = new Database('./database.db');
  }
  return db;
}
```

### 5. Composition Pattern (React)
Reusable chart configurations:
```jsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line dataKey="value" stroke="#3b82f6" />
  </LineChart>
</ResponsiveContainer>
```

---

## Data Flow Diagrams

### User Loads Dashboard

```
User visits /
    ↓
App.jsx renders
    ↓
Overview.jsx mounts
    ↓
useQuery hooks trigger
    ↓
7 parallel API requests:
  - GET /api/dashboard/kpis
  - GET /api/dashboard/user-growth
  - GET /api/dashboard/acquisition-funnel
  - GET /api/dashboard/user-locations
  - GET /api/dashboard/churn-cohorts
  - GET /api/dashboard/feature-usage
  - GET /api/dashboard/revenue-trends
    ↓
Express routes process requests
    ↓
SQLite queries execute
    ↓
JSON responses sent
    ↓
TanStack Query caches results
    ↓
Components render with data
```

### User Applies Filters

```
User types into filter inputs
    ↓
filters state updates (no API call)
    ↓
User clicks "Apply Filters"
    ↓
appliedFilters state updates
    ↓
useQuery detects queryKey change
    ↓
New API request with filter params
  GET /api/users?tier=professional&status=active
    ↓
Backend parses query parameters
    ↓
Dynamic SQL WHERE clause built
    ↓
Filtered results returned
    ↓
TanStack Query updates cache
    ↓
Table re-renders with filtered data
```

---

## Performance Optimizations

### Backend
1. **Database Indexes** - Fast lookups on filtered columns
2. **Pagination** - Limit query results (default 50 items)
3. **Prepared Statements** - Better-sqlite3 performance
4. **Connection Pooling** - Singleton database instance

### Frontend
1. **Code Splitting** - React.lazy() for route-based splitting (future)
2. **Query Caching** - TanStack Query caches for 5 minutes
3. **Memoization** - React.memo for expensive components (future)
4. **Virtual Scrolling** - For very long lists (future)
5. **Debouncing** - Apply-on-demand pattern prevents excessive API calls

---

## Security Considerations

### Current State (Development)
⚠️ **No authentication or authorization**
⚠️ **CORS allows all origins**
⚠️ **No rate limiting**
⚠️ **No input sanitization**

### Production Recommendations
1. **Authentication:** JWT tokens or session-based auth
2. **Authorization:** Role-based access control (RBAC)
3. **Input Validation:** Joi or Zod schemas
4. **SQL Injection Prevention:** Prepared statements (already using)
5. **Rate Limiting:** express-rate-limit
6. **CORS:** Restrict to production domain
7. **HTTPS:** TLS/SSL certificates
8. **Environment Variables:** Sensitive config in .env

---

## Scalability Considerations

### Current Limitations
- SQLite: Single-writer limitation
- No horizontal scaling
- In-process database (no separate DB server)
- File-based storage

### Migration Path for Scale
1. **Database:** SQLite → PostgreSQL or MySQL
2. **Caching:** Add Redis for query caching
3. **Load Balancing:** Multiple API servers behind nginx
4. **CDN:** Static assets on CloudFront/Cloudflare
5. **Microservices:** Split dashboard, users, revenue into separate services

---

## Technology Choices Rationale

### Why React?
- Component-based architecture
- Large ecosystem
- Great developer experience
- Strong community support

### Why TanStack Query?
- Eliminates boilerplate for data fetching
- Automatic caching and invalidation
- Loading and error states built-in
- Background refetching

### Why SQLite?
- Zero configuration
- Serverless (embedded database)
- Perfect for demos and prototypes
- Fast for read-heavy workloads

### Why Express?
- Minimal and unopinionated
- Huge middleware ecosystem
- Easy to understand
- Industry standard

### Why Recharts?
- React-native integration
- Declarative API
- Responsive by default
- Composable components

### Why React Simple Maps?
- Lightweight
- SVG-based (customizable)
- Good documentation
- Active maintenance

---

## Development vs Production

| Aspect | Development | Production |
|--------|-------------|------------|
| API Port | 3001 | 3001 or 80/443 |
| Frontend Port | 5173 (Vite) | Served by Express |
| CORS | Allow all | Specific origin |
| Database | File-based SQLite | PostgreSQL recommended |
| Logging | Console.log | Winston/Pino |
| Error Handling | Detailed errors | Generic messages |
| Minification | No | Yes |
| Source Maps | Yes | No |
| Hot Reload | Yes | No |

---

## Future Architecture Enhancements

### Short Term
- [ ] Environment configuration (.env)
- [ ] Error boundary components
- [ ] Loading skeletons
- [ ] Optimistic updates

### Medium Term
- [ ] WebSocket for real-time updates
- [ ] Service worker for offline support
- [ ] Progressive Web App (PWA)
- [ ] Background data sync

### Long Term
- [ ] GraphQL API (Apollo Server)
- [ ] Server-Side Rendering (Next.js)
- [ ] Microservices architecture
- [ ] Event-driven architecture (message queue)
