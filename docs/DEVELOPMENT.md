# Development Guide

## Getting Started

### Prerequisites
- **Node.js** 18.0.0 or higher
- **npm** 9.0.0 or higher
- **Git** (for version control)

### Initial Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd Interview
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up the database**
```bash
npm run setup-db
```

This command will:
- Create the SQLite database schema
- Generate 4,000+ sample records
- Import data into the database
- Create indexes for performance

4. **Start the development servers**

Terminal 1 - API Server:
```bash
npm run dev:api
```

Terminal 2 - Frontend Dev Server:
```bash
npm run dev:frontend
```

5. **Open the application**
- Frontend: http://localhost:5173
- API: http://localhost:3001

---

## Project Structure

```
Interview/
├── docs/                          # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── DATABASE_SCHEMA.md
│   └── DEVELOPMENT.md (this file)
├── input/                         # Generated CSV files
│   ├── users.csv
│   ├── revenue.csv
│   ├── usage_metrics.csv
│   └── marketing.csv
├── source/
│   ├── api/                       # Backend server
│   │   └── server.js              # Express app setup, CORS, routing
│   ├── routes/                    # API endpoint handlers
│   │   ├── dashboard.js           # Analytics aggregations
│   │   ├── users.js               # User CRUD operations
│   │   ├── revenue.js             # Revenue transactions
│   │   ├── usage.js               # Usage metrics
│   │   └── marketing.js           # Marketing campaigns
│   ├── database/                  # Database layer
│   │   ├── connection.js          # SQLite connection singleton
│   │   ├── init-db.js             # Schema creation
│   │   ├── generate-data.js       # Sample data generator
│   │   └── load-data.js           # CSV importer
│   ├── pages/                     # React page components
│   │   ├── Overview.jsx           # Dashboard with charts
│   │   ├── Users.jsx              # User list with filters
│   │   ├── Revenue.jsx            # Revenue table
│   │   ├── Usage.jsx              # Usage metrics
│   │   └── Marketing.jsx          # Marketing campaigns
│   ├── components/                # Reusable React components
│   ├── services/                  # Frontend services
│   │   └── api.js                 # Axios API client
│   ├── App.jsx                    # React app root
│   ├── main.jsx                   # React entry point
│   ├── index.html                 # HTML template
│   ├── index.css                  # Global styles
│   └── vite.config.js             # Vite configuration
├── database.db                    # SQLite database file
├── package.json
├── .gitignore
└── README.md
```

---

## Development Workflow

### Making Changes

1. **Database Schema Changes**
   - Edit `source/database/init-db.js`
   - Run `npm run init-db` to recreate schema
   - Update `generate-data.js` if new fields added
   - Run `npm run setup-db` to regenerate all data

2. **Adding New API Endpoints**
   - Add route handler in appropriate file in `source/routes/`
   - Import and register route in `source/api/server.js`
   - Add API function in `source/services/api.js`
   - Use the new API function in React components

3. **Creating New React Components**
   - Add component file in `source/components/` or `source/pages/`
   - Import and use in parent components
   - Use TanStack Query for data fetching
   - Follow existing styling patterns

4. **Adding New Visualizations**
   - Use Recharts for standard charts (line, bar, area, pie)
   - Use React Simple Maps for geographic visualizations
   - Use HTML tables with inline styles for heatmaps
   - Keep chart height at 300-500px for consistency

---

## Available Scripts

### Database Management
```bash
npm run init-db          # Create database schema only
npm run generate-data    # Generate CSV sample data
npm run load-data        # Import CSV into database
npm run setup-db         # Complete setup (all 3 above)
```

### Development
```bash
npm run dev:api          # Start Express server with watch mode
npm run dev:frontend     # Start Vite dev server with HMR
```

### Production
```bash
npm run build            # Build optimized production bundle
npm run preview          # Preview production build locally
```

---

## Key Technologies

### Backend

**Express.js**
- RESTful API design
- CORS enabled for development
- JSON response format
- Error handling middleware

**SQLite + better-sqlite3**
- Synchronous API (no callbacks/promises needed)
- Prepared statements for performance
- Transaction support
- In-memory or file-based storage

### Frontend

**React 18**
- Functional components with hooks
- React Router for navigation
- Client-side routing

**TanStack Query (React Query)**
- Server state management
- Automatic caching and refetching
- Query invalidation
- Loading/error states

**Recharts**
- Declarative chart components
- Responsive containers
- Tooltips and legends
- Custom styling support

**React Simple Maps**
- SVG-based world maps
- Custom markers and annotations
- TopoJSON support
- Responsive projections

---

## Common Tasks

### Adding a Filter to a Page

1. Add filter state:
```jsx
const [filters, setFilters] = useState({
  newFilter: ''
})
const [appliedFilters, setAppliedFilters] = useState({})
```

2. Add filter UI:
```jsx
<input
  type="text"
  value={filters.newFilter}
  onChange={(e) => setFilters({...filters, newFilter: e.target.value})}
/>
```

3. Apply filters on button click:
```jsx
<button onClick={() => setAppliedFilters(filters)}>
  Apply Filters
</button>
```

4. Use in query:
```jsx
const { data } = useQuery({
  queryKey: ['data', appliedFilters],
  queryFn: () => getData(appliedFilters)
})
```

### Creating a New Dashboard Chart

1. Add backend endpoint in `routes/dashboard.js`:
```javascript
router.get('/new-metric', (req, res) => {
  try {
    const data = db.prepare(`
      SELECT ... FROM ...
    `).all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

2. Add API function in `services/api.js`:
```javascript
export const getNewMetric = () => api.get('/dashboard/new-metric')
```

3. Add query in Overview.jsx:
```jsx
const { data: newMetric } = useQuery({
  queryKey: ['new-metric'],
  queryFn: async () => {
    const response = await getNewMetric()
    return response.data
  }
})
```

4. Add visualization:
```jsx
<div className="card">
  <h2>New Metric</h2>
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={newMetric}>
      {/* Chart configuration */}
    </LineChart>
  </ResponsiveContainer>
</div>
```

### Modifying Sample Data Generation

1. Edit `source/database/generate-data.js`
2. Modify the data generation logic
3. Run `npm run generate-data` to create new CSV files
4. Run `npm run load-data` to import into database

---

## Debugging

### Backend Debugging

**Enable verbose logging:**
```javascript
// In source/api/server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`, req.query, req.body);
  next();
});
```

**Test API endpoints:**
```bash
# Using curl
curl http://localhost:3001/api/dashboard/kpis

# Using httpie
http GET http://localhost:3001/api/dashboard/kpis
```

**Database debugging:**
```javascript
// In any route handler
console.log('Query:', stmt.source);
console.log('Result:', data);
```

### Frontend Debugging

**React Query DevTools:**
Already installed - press `Ctrl+Shift+D` or add:
```jsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<ReactQueryDevtools initialIsOpen={false} />
```

**Console logging:**
```jsx
console.log('Data:', data);
console.log('Loading:', isLoading);
console.log('Error:', error);
```

**Network inspection:**
- Open browser DevTools (F12)
- Go to Network tab
- Filter by "XHR" or "Fetch"
- Inspect request/response

---

## Code Style

### JavaScript
- Use ES6+ features (arrow functions, destructuring, template literals)
- Prefer `const` over `let`, avoid `var`
- Use async/await for promises
- Use functional programming patterns where appropriate

### React
- Functional components only (no class components)
- Use hooks for state and side effects
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

### SQL
- Use uppercase for SQL keywords
- Use prepared statements (prevents SQL injection)
- Add indexes for frequently queried columns
- Use meaningful table and column names

### CSS
- Use inline styles for component-specific styling
- Use global CSS (`index.css`) for layout and utilities
- Keep styles close to components
- Use consistent spacing and color palette

---

## Performance Tips

### Backend
- Use indexes on frequently filtered columns
- Limit result sets with `LIMIT` clause
- Use pagination for large datasets
- Cache expensive queries if needed

### Frontend
- Use React Query's cache effectively
- Implement pagination for large lists
- Lazy load components with `React.lazy()`
- Optimize re-renders with `useMemo` and `useCallback`
- Use `ResponsiveContainer` for charts to avoid layout shifts

---

## Troubleshooting

### Port Already in Use
The API server automatically kills existing Node processes on port 3001. If you still see the error:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Database Locked
SQLite can only handle one write at a time. If you see "database locked":
- Make sure you're not running multiple API servers
- Check for long-running transactions
- Restart the API server

### Module Not Found
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Vite Build Errors
```bash
# Clear Vite cache
rm -rf source/.vite
npm run dev:frontend
```

---

## Testing

Currently, no automated tests are implemented. Future additions:

**Backend Testing:**
- Unit tests with Jest or Vitest
- API endpoint tests with Supertest
- Database query tests

**Frontend Testing:**
- Component tests with React Testing Library
- Integration tests with Cypress or Playwright
- Visual regression tests

---

## Deployment

### Production Build

1. Build the frontend:
```bash
npm run build
```

2. Serve static files from Express:
```javascript
// In source/api/server.js
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use(express.static(path.join(__dirname, '../dist')))
```

3. Start the production server:
```bash
NODE_ENV=production node source/api/server.js
```

### Environment Variables
Create `.env` file for configuration:
```
PORT=3001
DATABASE_PATH=./database.db
NODE_ENV=development
```

### Hosting Options
- **Backend:** Heroku, Railway, Render, AWS EC2
- **Database:** SQLite file (include in deployment) or migrate to PostgreSQL
- **Frontend:** Netlify, Vercel, AWS S3 + CloudFront

---

## Contributing

1. Create a feature branch
2. Make changes with clear commit messages
3. Test thoroughly
4. Create pull request with description
5. Wait for code review

---

## Resources

- [React Documentation](https://react.dev/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Recharts Documentation](https://recharts.org/)
- [React Simple Maps](https://www.react-simple-maps.io/)
- [Express.js Guide](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
