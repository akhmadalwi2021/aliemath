import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_DATABASE } from './src/data/initialData';
import { AppDatabase } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase payload limit for materials with images/attachments
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache of database
let inMemoryDatabase: AppDatabase;
let lastUpdatedAt = new Date().toISOString();

// Load initial database from disk or seed
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    inMemoryDatabase = JSON.parse(raw);
    console.log('[Server] Loaded database from data/database.json');
  } else {
    inMemoryDatabase = INITIAL_DATABASE;
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
    console.log('[Server] Seeded data/database.json with initial database');
  }
} catch (err) {
  console.error('[Server] Error reading database.json, using initial data:', err);
  inMemoryDatabase = INITIAL_DATABASE;
}

// ==========================================
// API ROUTES (Must be placed before Vite)
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET /api/database - Retrieves the central database for all devices (HP, Desktop, etc.)
app.get('/api/database', (req, res) => {
  res.json({
    success: true,
    data: inMemoryDatabase,
    updatedAt: lastUpdatedAt,
  });
});

// GET /api/database/status - Quick status check for auto-polling
app.get('/api/database/status', (req, res) => {
  res.json({
    success: true,
    updatedAt: lastUpdatedAt,
    counts: {
      materials: inMemoryDatabase?.materials?.length || 0,
      exams: inMemoryDatabase?.exams?.length || 0,
      users: inMemoryDatabase?.users?.length || 0,
      attempts: inMemoryDatabase?.attempts?.length || 0,
    },
  });
});

// POST /api/database - Updates the central database from admin changes or exam submissions
app.post('/api/database', (req, res) => {
  try {
    const incomingData = req.body?.data || req.body;
    if (!incomingData || !Array.isArray(incomingData.materials) || !Array.isArray(incomingData.exams)) {
      return res.status(400).json({
        success: false,
        message: 'Format data database tidak valid.',
      });
    }

    inMemoryDatabase = incomingData;
    lastUpdatedAt = new Date().toISOString();

    // Persist to disk asynchronously
    fs.writeFile(DB_FILE, JSON.stringify(incomingData, null, 2), (err) => {
      if (err) {
        console.error('[Server] Failed to write database.json to disk:', err);
      } else {
        console.log('[Server] Successfully saved database.json to disk at', lastUpdatedAt);
      }
    });

    return res.json({
      success: true,
      message: 'Database berhasil diperbarui dan disinkronisasi ke seluruh perangkat.',
      updatedAt: lastUpdatedAt,
    });
  } catch (err: any) {
    console.error('[Server] Error saving database:', err);
    return res.status(500).json({
      success: false,
      message: `Gagal menyimpan database: ${err?.message || 'Unknown error'}`,
    });
  }
});

// POST /api/database/reset - Reset to factory defaults if requested
app.post('/api/database/reset', (req, res) => {
  try {
    inMemoryDatabase = INITIAL_DATABASE;
    lastUpdatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATABASE, null, 2), 'utf-8');
    return res.json({
      success: true,
      data: inMemoryDatabase,
      message: 'Database berhasil direset ke pengaturan awal.',
      updatedAt: lastUpdatedAt,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ==========================================
// VITE MIDDLEWARE / STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Aliemath full-stack running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
