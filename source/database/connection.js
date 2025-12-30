import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create/connect to SQLite database (store in database folder)
const dbPath = join(__dirname, 'analytics.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log(`✓ Database connected at: ${dbPath}`);

export default db;
