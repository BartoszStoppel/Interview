# Deploying to Render

This guide walks you through deploying the SaaS Analytics Dashboard to Render.

## Overview

Render will host both your backend API and frontend in a single web service. The frontend will be built as static files and served by Express.

---

## Prerequisites

1. A [Render account](https://render.com) (free tier available)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. All changes committed and pushed

---

## Step 1: Prepare Your Application

### 1.1 Update server.js for Production

The server needs to serve the frontend build in production:

**Edit `source/api/server.js`:**

```javascript
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const PORT = process.env.PORT || 3001

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middleware
app.use(cors())
app.use(express.json())

// API Routes
import dashboardRoutes from '../routes/dashboard.js'
import usersRoutes from '../routes/users.js'
import revenueRoutes from '../routes/revenue.js'
import usageRoutes from '../routes/usage.js'
import marketingRoutes from '../routes/marketing.js'

app.use('/api/dashboard', dashboardRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/revenue', revenueRoutes)
app.use('/api/usage', usageRoutes)
app.use('/api/marketing', marketingRoutes)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve frontend build files
  app.use(express.static(path.join(__dirname, '../../dist')))
  
  // Serve index.html for any route not matched by API
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
```

### 1.2 Add Production Build Script

**Update `package.json` scripts:**

```json
{
  "scripts": {
    "init-db": "node source/database/init-db.js",
    "generate-data": "node source/database/generate-data.js",
    "load-data": "node source/database/load-data.js",
    "setup-db": "npm run init-db && npm run generate-data && npm run load-data",
    "api": "node source/api/server.js",
    "dev:api": "node --watch source/api/server.js",
    "dev:frontend": "vite --config source/vite.config.js",
    "build": "vite build --config source/vite.config.js",
    "preview": "vite preview --config source/vite.config.js",
    "start": "NODE_ENV=production node source/api/server.js",
    "render-build": "npm install && npm run build && npm run setup-db"
  }
}
```

### 1.3 Update Vite Config for Production

**Edit `source/vite.config.js`:**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './source',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
```

### 1.4 Create render.yaml

Create a file at the root of your project:

**`render.yaml`:**

```yaml
services:
  - type: web
    name: saas-analytics-dashboard
    env: node
    region: oregon
    plan: free
    buildCommand: npm run render-build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

---

## Step 2: Push to Git

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Step 3: Deploy on Render

### 3.1 Create New Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your Git repository
4. Select your repository from the list

### 3.2 Configure Service

**Basic Settings:**
- **Name:** `saas-analytics-dashboard` (or your choice)
- **Region:** Choose closest to your users
- **Branch:** `main` (or your default branch)
- **Root Directory:** Leave blank
- **Runtime:** `Node`

**Build Settings:**
- **Build Command:** `npm run render-build`
- **Start Command:** `npm start`

**Environment Variables:**
- Click **"Add Environment Variable"**
- Add: `NODE_ENV` = `production`
- The `PORT` variable is automatically set by Render

**Instance Type:**
- Choose **Free** for testing (spins down after inactivity)
- Choose **Starter** ($7/month) for always-on service

### 3.3 Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Run `npm run build` (builds frontend)
   - Run `npm run setup-db` (creates database with sample data)
   - Start the server with `npm start`

3. Monitor the build logs in the Render dashboard
4. Wait for deployment to complete (~3-5 minutes)

---

## Step 4: Access Your Application

Once deployed, Render provides a URL:
```
https://saas-analytics-dashboard.onrender.com
```

Your dashboard will be live at this URL!

---

## Important Considerations

### SQLite on Render (Free Tier Limitation)

⚠️ **Important:** Render's free tier uses ephemeral storage, meaning:
- Database resets when the service restarts
- Data is lost after 15 minutes of inactivity (free tier spins down)

**Solutions:**

1. **For Demo/Testing (Current Setup):**
   - Database regenerates on each deploy
   - Sample data is always fresh
   - Good enough for portfolio/interviews

2. **For Persistent Data (Upgrade Options):**

   **Option A: Use Render PostgreSQL**
   - Create a PostgreSQL database on Render
   - Migrate from SQLite to PostgreSQL
   - Requires code changes (SQL dialect differences)
   
   **Option B: Use External Database**
   - Use [Railway](https://railway.app/) PostgreSQL
   - Use [Supabase](https://supabase.com/) (free tier available)
   - Use [PlanetScale](https://planetscale.com/) MySQL

### Environment Variables

If you add any secrets (API keys, etc.), add them in Render dashboard:
1. Go to your service
2. Click **"Environment"** tab
3. Add variables
4. Redeploy (automatic)

---

## Troubleshooting

### Build Fails

**Check build logs:**
- View in Render dashboard under "Logs" → "Build"
- Common issues:
  - Missing dependencies: Run `npm install` locally first
  - Node version mismatch: Add `"engines"` to package.json

**Add Node version to package.json:**
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### Application Crashes

**Check runtime logs:**
- View in Render dashboard under "Logs" → "Deploy"
- Common issues:
  - Database path issues: Ensure `database.db` is in root directory
  - Port binding: Always use `process.env.PORT`

### 404 Errors for Routes

**Problem:** Direct URLs like `/users` return 404

**Solution:** Already handled in Step 1.1 with the catch-all route:
```javascript
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/index.html'))
})
```

### Database Not Found

**Problem:** API returns "database not found" errors

**Solution:** Ensure `npm run setup-db` runs in the build command:
```json
"render-build": "npm install && npm run build && npm run setup-db"
```

---

## Updating Your Deployment

Render automatically redeploys when you push to your connected branch:

```bash
# Make changes locally
git add .
git commit -m "Update dashboard"
git push origin main
```

Render will:
1. Detect the push
2. Rebuild automatically
3. Deploy new version

**Manual Redeploy:**
- Go to Render dashboard
- Click "Manual Deploy" → "Clear build cache & deploy"

---

## Monitoring

### View Logs
```
Render Dashboard → Your Service → Logs
```

### Check Status
```
Render Dashboard → Your Service → Events
```

### Metrics (Paid Plans)
- CPU usage
- Memory usage
- Request count
- Response times

---

## Cost Optimization

### Free Tier
- ✅ Perfect for portfolios and demos
- ✅ Automatic HTTPS
- ✅ Auto-deploy from Git
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start (~30 seconds)
- ⚠️ Ephemeral storage (data loss)

### Starter Plan ($7/month)
- ✅ Always on (no spin-down)
- ✅ Faster deployment
- ✅ Custom domains
- ⚠️ Still ephemeral storage

### Pro Plan (for Production)
- ✅ Persistent disk available
- ✅ Auto-scaling
- ✅ Advanced metrics

---

## Alternative: Deploy with Persistent Database

If you need data persistence, follow this path:

### 1. Create PostgreSQL Database on Render

1. Render Dashboard → **New +** → **PostgreSQL**
2. Name: `saas-analytics-db`
3. Plan: Free or Starter
4. Create database

### 2. Get Database URL

Copy the **Internal Database URL** from the database dashboard

### 3. Update Your Code

Install PostgreSQL driver:
```bash
npm install pg
```

Update database connection to use PostgreSQL:
```javascript
// source/database/connection.js
import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export default pool
```

### 4. Add Environment Variable

In your web service settings:
- Add `DATABASE_URL` with the value from step 2

This requires significant code changes to adapt SQL queries from SQLite to PostgreSQL syntax.

---

## Best Practices

1. **Use environment variables** for configuration
2. **Check logs regularly** after deployment
3. **Test locally first** with `npm run build && npm start`
4. **Monitor cold starts** on free tier
5. **Set up health checks** (optional, paid plans)

---

## Testing Before Deploy

Run production mode locally:

```bash
# Build frontend
npm run build

# Set production environment
export NODE_ENV=production

# Start server
npm start

# Visit http://localhost:3001
```

---

## Summary

1. ✅ Update `server.js` to serve static files
2. ✅ Add `render-build` script to `package.json`
3. ✅ Create `render.yaml` configuration
4. ✅ Push to Git
5. ✅ Create web service on Render
6. ✅ Deploy and monitor logs
7. ✅ Access your live application!

Your dashboard will be accessible at `https://[your-service-name].onrender.com`

For persistent data needs, consider upgrading to PostgreSQL or using the paid tier with persistent disks.
