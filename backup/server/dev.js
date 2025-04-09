// This is a simplified server for development
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import session from 'express-session';
import MemoryStore from 'memorystore';
import crypto from 'crypto';
import { setupAuth } from './auth.js';
import { setupVite } from './vite.js';
import { log } from './vite.js';
import { createServer } from 'http';
import { registerRoutes } from './routes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Set up __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Generate a session secret if one doesn't exist
if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = crypto.randomBytes(32).toString('hex');
  log('Generated a random session secret for development');
}

// Set up CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'client')));

// Create HTTP server
const server = createServer(app);

// Setup Vite
await setupVite(app, server);

// Set up auth
setupAuth(app);

// Register routes
await registerRoutes(app);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  log(`serving on port ${PORT}`);
});

export default server;