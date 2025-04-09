// Simple wrapper for server startup in ES modules context

// Ensure environment variables are correctly set
process.env.NODE_ENV = 'development';
process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'superSecretKeyForDevEnvironmentOnly';

// Import the server directly
import './server/index.js';