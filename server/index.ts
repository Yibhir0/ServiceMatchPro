import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Log startup message
console.log("Starting Service Match Pro server...");

// Get directory paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const goJsPath = path.join(rootDir, 'go.js');

// Check if go.js exists
if (fs.existsSync(goJsPath)) {
  console.log("Found go.js, executing...");
  
  // Execute go.js in a child process
  const childProcess = spawn('node', [goJsPath], {
    stdio: 'inherit',
    detached: false
  });
  
  // Handle process exit
  childProcess.on('error', (err) => {
    console.error('Failed to start go.js:', err);
    startFallbackServer();
  });
  
  // Do not exit this process, let the child process run
} else {
  console.log("go.js not found, starting minimal fallback server");
  startFallbackServer();
}

// Fallback server function
function startFallbackServer() {
  // Create Express app
  const app = express();
  const port = Number(process.env.PORT) || 5000; // Use port 5000 for Replit workflow

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Test route
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Fallback API is working!' });
  });

  // Create and start server
  const server = createServer(app);
  server.listen(port, () => {
    console.log(`Fallback server running at: http://localhost:${port}`);
  });
}