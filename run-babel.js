// Custom script to start the app with babel-node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting app with babel-node...');

// Start the server using babel-node to handle JSX
const server = spawn('./node_modules/.bin/babel-node', [join(__dirname, 'server', 'index.js')], {
  stdio: 'inherit',
  shell: true
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.kill('SIGINT');
  process.exit(0);
});

console.log('Server started on port 5000');