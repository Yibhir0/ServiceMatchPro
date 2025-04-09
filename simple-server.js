import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Create fallback public directory
const staticPath = join(__dirname, 'public');
if (!fs.existsSync(staticPath)) {
  fs.mkdirSync(staticPath, { recursive: true });
  // Create a simple index.html file
  fs.writeFileSync(join(staticPath, 'index.html'), `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Match Pro</title>
      <style>
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background-color: #f0f9ff; }
        .header { background-color: #0ea5e9; color: white; padding: 2rem; border-radius: 0.5rem; margin-bottom: 2rem; }
        .card { background: white; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Service Match Pro</h1>
        <p>Minimal API Server Running</p>
      </div>
      <div class="card">
        <h2>API Status</h2>
        <p id="api-status">Checking API status...</p>
      </div>
      <script>
        // Test API connection
        fetch('/api/test')
          .then(res => res.json())
          .then(data => {
            document.getElementById('api-status').textContent = 'API is working! Response: ' + JSON.stringify(data);
          })
          .catch(err => {
            document.getElementById('api-status').textContent = 'API error: ' + err.message;
          });
      </script>
    </body>
    </html>
  `);
}

app.use(express.static(staticPath));

// Handle SPA routes
app.get('*', (req, res) => {
  res.sendFile(join(staticPath, 'index.html'));
});

// Create and start server
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at: http://localhost:${port}`);
});