// Simple CommonJS script to start the application
// This works with Replit's workflow system
const { execSync } = require('child_process');

console.log('Starting Service Match Pro...');
try {
  execSync('node go.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting the application:', error);
  process.exit(1);
}