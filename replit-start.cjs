// Script for starting the server on Replit (CommonJS version)
// This will be used by running node directly

console.log('Starting server on Replit...');

// Ensure environment variables are correctly set
process.env.NODE_ENV = 'development';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'superSecretKeyForDevEnvironmentOnly';

// Use child_process to spawn the server
const { spawn } = require('child_process');
const path = require('path');

// Start the server using node directly
const serverProcess = spawn('node', ['server/index.js'], {
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