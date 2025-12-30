import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import usersRouter from '../routes/users.js';
import revenueRouter from '../routes/revenue.js';
import usageRouter from '../routes/usage.js';
import marketingRouter from '../routes/marketing.js';
import dashboardRouter from '../routes/dashboard.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;

// Function to kill process using the port
async function killProcessOnPort(port) {
  try {
    // Find process using the port
    const { stdout } = await execAsync(`lsof -ti :${port}`);
    const pid = stdout.trim();
    
    if (pid) {
      // Check if it's a node process
      const { stdout: processInfo } = await execAsync(`ps -p ${pid} -o comm=`);
      if (processInfo.includes('node')) {
        console.log(`⚠️  Killing existing Node.js process (PID: ${pid}) on port ${port}...`);
        await execAsync(`kill -9 ${pid}`);
        // Wait a moment for the port to be released
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
      }
    }
  } catch (error) {
    // No process found or command failed, which is fine
    return false;
  }
  return false;
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', usersRouter);
app.use('/api/revenue', revenueRouter);
app.use('/api/usage', usageRouter);
app.use('/api/marketing', marketingRouter);
app.use('/api/dashboard', dashboardRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve frontend build files
  app.use(express.static(path.join(__dirname, '../../dist')));
  
  // Serve index.html for any route not matched by API
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server with auto-restart capability
async function startServer() {
  try {
    const server = app.listen(PORT, () => {
      console.log(`🚀 API server running on http://localhost:${PORT}`);
      console.log(`📊 Dashboard API available at http://localhost:${PORT}/api/dashboard`);
    });

    server.on('error', async (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${PORT} is already in use.`);
        const killed = await killProcessOnPort(PORT);
        if (killed) {
          console.log(`✅ Port ${PORT} cleared. Restarting server...`);
          startServer(); // Retry starting the server
        } else {
          console.error(`❌ Port ${PORT} is in use by a non-Node process. Please free the port manually.`);
          process.exit(1);
        }
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
