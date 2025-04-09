// Simple script to start the server in development mode
// Intended to be used as a drop-in replacement for `tsx server/index.ts`

import { spawn } from 'child_process';

console.log('Starting server via node directly...');

// Start the server with node
const serverProcess = spawn('node', ['run.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development',
    SESSION_SECRET: process.env.SESSION_SECRET || 'superSecretKeyForDevEnvironmentOnly'
  }
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Stopping server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});