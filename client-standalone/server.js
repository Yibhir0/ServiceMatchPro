import express from 'express';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 5173;

// Serve static files from the client-standalone/dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle all other routes by serving the index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Create HTTP server
const server = createServer(app);

// Start the server
server.listen(port, '0.0.0.0', () => {
  console.log(`Client server running at http://localhost:${port}`);
});