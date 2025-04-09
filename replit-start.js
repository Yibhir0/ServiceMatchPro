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
app.use(express.urlencoded({ extended: true }));

// Simple API test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Demo users for authentication
const users = [
  { id: 1, username: 'sarahsmith', password: 'pass123', fullName: 'Sarah Smith', role: 'customer' },
  { id: 2, username: 'johnplumber', password: 'pass123', fullName: 'John Plumber', role: 'provider' },
  { id: 3, username: 'admin', password: 'admin123', fullName: 'Admin User', role: 'admin' }
];

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
  const { username } = req.body;
  const exists = users.find(u => u.username === username);
  
  if (exists) {
    res.status(400).json({ message: 'Username already exists' });
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
  // This would normally check for a session/token
  // For demo, just return the first user
  const { password, ...userWithoutPassword } = users[0];
  res.json(userWithoutPassword);
});

// Serve static files from client-standalone/dist directory
const clientDistPath = join(__dirname, 'client-standalone', 'dist');

// Check if dist directory exists, if not serve the client-standalone/src
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
} else {
  app.use(express.static(join(__dirname, 'client-standalone', 'public')));
}

// SPA fallback - serve index.html for all other routes
app.get('*', (req, res) => {
  let indexPath;
  if (fs.existsSync(join(clientDistPath, 'index.html'))) {
    indexPath = join(clientDistPath, 'index.html');
  } else {
    indexPath = join(__dirname, 'client-standalone', 'index.html');
  }
  res.sendFile(indexPath);
});

// Create and start server
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});