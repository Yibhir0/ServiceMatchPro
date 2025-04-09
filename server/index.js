import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

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

// Create and start server
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
  console.log(`Server running at: http://localhost:${port}`);
});