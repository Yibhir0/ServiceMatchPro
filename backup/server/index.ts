import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get directory paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const port = Number(process.env.PORT) || 5000; // Use port 5000 for Replit workflow

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample users for login
const users = [
  { id: 1, username: 'sarahsmith', password: 'pass123', fullName: 'Sarah Smith', role: 'customer', email: 'sarah@example.com' },
  { id: 2, username: 'johnplumber', password: 'pass123', fullName: 'John Plumber', role: 'provider', email: 'john@example.com' },
  { id: 3, username: 'admin', password: 'admin123', fullName: 'Admin User', role: 'admin', email: 'admin@example.com' }
];

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// API base route
app.get('/api', (req, res) => {
  res.json({ message: 'ServiceMatchPro API is running' });
});

// Auth routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Don't send password to client
    const { password, ...userWithoutPassword } = user;
    res.status(200).json(userWithoutPassword);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/api/register', (req, res) => {
  const { username, email } = req.body;
  const existingUsername = users.find(u => u.username === username);
  const existingEmail = users.find(u => u.email === email);
  
  if (existingUsername) {
    res.status(400).json({ message: 'Username already exists' });
  } else if (existingEmail) {
    res.status(400).json({ message: 'Email already registered' });
  } else {
    const newUser = {
      id: users.length + 1,
      ...req.body,
      role: req.body.role || 'customer'
    };
    users.push(newUser);
    
    // Don't send password to client
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  }
});

app.get('/api/user', (req, res) => {
  // For demo, just return the first user
  const { password, ...userWithoutPassword } = users[0];
  res.json(userWithoutPassword);
});

// Static file serving
// Try to serve from client-standalone/dist
const clientStandalonePath = path.join(__dirname, '..', 'client-standalone', 'dist');
const clientPath = path.join(__dirname, '..', 'client', 'dist');
const publicPath = path.join(__dirname, '..', 'public');

let staticPath: string;

if (fs.existsSync(clientStandalonePath)) {
  staticPath = clientStandalonePath;
  console.log('Serving static files from client-standalone/dist');
} else if (fs.existsSync(clientPath)) {
  staticPath = clientPath;
  console.log('Serving static files from client/dist');
} else {
  // Create fallback public directory
  staticPath = publicPath;
  if (!fs.existsSync(staticPath)) {
    fs.mkdirSync(staticPath, { recursive: true });
    // Create a simple index.html file
    fs.writeFileSync(path.join(staticPath, 'index.html'), `
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
          .login-form { margin: 2rem 0; }
          .form-group { margin-bottom: 1rem; }
          .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
          .form-group input { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 0.25rem; }
          .button { background-color: #0ea5e9; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; }
          .button:hover { background-color: #0891ce; }
          .demo-accounts { background-color: #f3f4f6; padding: 1rem; border-radius: 0.25rem; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Service Match Pro</h1>
          <p>Connecting customers with trusted local service providers</p>
        </div>
        
        <div class="card">
          <h2>API Status</h2>
          <p id="api-status">Checking API status...</p>
        </div>
        
        <div class="card">
          <h2>Login</h2>
          <p>Try one of our demo accounts:</p>
          <div class="demo-accounts">
            <p><strong>Customer:</strong> username: sarahsmith, password: pass123</p>
            <p><strong>Provider:</strong> username: johnplumber, password: pass123</p>
            <p><strong>Admin:</strong> username: admin, password: admin123</p>
          </div>
          
          <form class="login-form" id="login-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" name="username" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>
            <button type="submit" class="button">Login</button>
          </form>
          <div id="login-result"></div>
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
            
          // Handle login form
          document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
              const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
              });
              
              const result = await response.json();
              
              if (response.ok) {
                document.getElementById('login-result').innerHTML = '<p style="color: green">Login successful! Logged in as: ' + result.fullName + ' (' + result.role + ')</p>';
              } else {
                document.getElementById('login-result').innerHTML = '<p style="color: red">Login failed: ' + result.message + '</p>';
              }
            } catch (err) {
              document.getElementById('login-result').innerHTML = '<p style="color: red">Error: ' + err.message + '</p>';
            }
          });
        </script>
      </body>
      </html>
    `);
  }
  console.log('Serving static files from fallback public directory');
}

app.use(express.static(staticPath));

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Create and start server
const server = createServer(app);
server.listen(port, () => {
  console.log(`
=========================================
 Service Match Pro
=========================================
 Server running at: http://localhost:${port}
 API endpoint: http://localhost:${port}/api/test
=========================================
  `);
});