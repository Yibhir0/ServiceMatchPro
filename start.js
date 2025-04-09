// Simple script to start the app
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting app...');

// Start the server
const server = spawn('node', [join(__dirname, 'server', 'index.js')], {
  stdio: 'inherit'
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

console.log('Server started on port 5000');