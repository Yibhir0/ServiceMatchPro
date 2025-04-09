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

// API routes

// Demo data
const users = [
  { id: 1, username: 'sarahsmith', password: 'pass123', fullName: 'Sarah Smith', role: 'customer', email: 'sarah@example.com' },
  { id: 2, username: 'johnplumber', password: 'pass123', fullName: 'John Plumber', role: 'provider', email: 'john@example.com' },
  { id: 3, username: 'admin', password: 'admin123', fullName: 'Admin User', role: 'admin', email: 'admin@example.com' }
];

const services = [
  { id: 1, name: 'Plumbing', icon: 'PipeValve', description: 'Fix leaks, clogs, and all plumbing issues' },
  { id: 2, name: 'Electrical', icon: 'Zap', description: 'Installation and repair of electrical systems' },
  { id: 3, name: 'Cleaning', icon: 'Sparkles', description: 'Professional cleaning services' },
  { id: 4, name: 'Landscaping', icon: 'TreePine', description: 'Garden and yard maintenance' },
  { id: 5, name: 'HVAC', icon: 'Thermometer', description: 'Heating, ventilation, and air conditioning' },
  { id: 6, name: 'Painting', icon: 'Paintbrush', description: 'Interior and exterior painting' }
];

const providers = [
  { id: 1, userId: 2, serviceId: 1, bio: 'Professional plumber with 10+ years of experience', hourlyRate: 65, city: 'Boston', rating: 4.8 },
  { id: 2, userId: 4, serviceId: 2, bio: 'Licensed electrician specializing in residential work', hourlyRate: 75, city: 'New York', rating: 4.5 },
  { id: 3, userId: 5, serviceId: 3, bio: 'Thorough and detail-oriented cleaning service', hourlyRate: 40, city: 'Chicago', rating: 4.9 },
  { id: 4, userId: 6, serviceId: 4, bio: 'Creative landscaper with eye for design', hourlyRate: 50, city: 'Boston', rating: 4.3 },
  { id: 5, userId: 7, serviceId: 5, bio: 'HVAC technician with all certifications', hourlyRate: 70, city: 'New York', rating: 4.7 },
  { id: 6, userId: 8, serviceId: 6, bio: 'Experienced painter with attention to detail', hourlyRate: 45, city: 'Chicago', rating: 4.4 }
];

const bookings = [
  { id: 1, customerId: 1, providerId: 1, serviceId: 1, status: 'completed', date: '2023-06-15', time: '14:00', address: '123 Main St, Boston', total: 130 },
  { id: 2, customerId: 1, providerId: 4, serviceId: 4, status: 'scheduled', date: '2023-06-20', time: '10:00', address: '123 Main St, Boston', total: 100 },
  { id: 3, customerId: 1, providerId: 2, serviceId: 2, status: 'pending', date: '2023-06-25', time: '09:00', address: '123 Main St, Boston', total: 150 }
];

// API Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
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

// Service routes
app.get('/api/services', (req, res) => {
  res.json(services);
});

app.get('/api/services/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const service = services.find(s => s.id === id);
  
  if (service) {
    res.json(service);
  } else {
    res.status(404).json({ message: 'Service not found' });
  }
});

// Provider routes
app.get('/api/providers', (req, res) => {
  const { serviceId, city, search } = req.query;
  
  let results = [...providers];
  
  if (serviceId) {
    results = results.filter(p => p.serviceId === parseInt(serviceId));
  }
  
  if (city) {
    results = results.filter(p => p.city.toLowerCase() === city.toLowerCase());
  }
  
  if (search) {
    const searchLower = search.toLowerCase();
    results = results.filter(p => {
      const service = services.find(s => s.id === p.serviceId);
      return (
        p.bio.toLowerCase().includes(searchLower) ||
        service.name.toLowerCase().includes(searchLower) ||
        p.city.toLowerCase().includes(searchLower)
      );
    });
  }
  
  // Add user and service details
  const providersWithDetails = results.map(provider => {
    const user = users.find(u => u.id === provider.userId);
    const service = services.find(s => s.id === provider.serviceId);
    
    return {
      ...provider,
      fullName: user?.fullName || 'Unknown',
      serviceName: service?.name || 'Unknown',
      serviceIcon: service?.icon || 'QuestionMark'
    };
  });
  
  res.json(providersWithDetails);
});

app.get('/api/providers/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const provider = providers.find(p => p.id === id);
  
  if (provider) {
    const user = users.find(u => u.id === provider.userId);
    const service = services.find(s => s.id === provider.serviceId);
    
    const providerWithDetails = {
      ...provider,
      fullName: user?.fullName || 'Unknown',
      email: user?.email || 'unknown@example.com',
      serviceName: service?.name || 'Unknown',
      serviceIcon: service?.icon || 'QuestionMark'
    };
    
    res.json(providerWithDetails);
  } else {
    res.status(404).json({ message: 'Provider not found' });
  }
});

// Booking routes
app.get('/api/bookings', (req, res) => {
  const { customerId, providerId } = req.query;
  
  let results = [...bookings];
  
  if (customerId) {
    results = results.filter(b => b.customerId === parseInt(customerId));
  }
  
  if (providerId) {
    results = results.filter(b => b.providerId === parseInt(providerId));
  }
  
  // Add provider and service details
  const bookingsWithDetails = results.map(booking => {
    const provider = providers.find(p => p.id === booking.providerId);
    const user = users.find(u => u.id === provider.userId);
    const service = services.find(s => s.id === booking.serviceId);
    
    return {
      ...booking,
      providerName: user?.fullName || 'Unknown',
      serviceName: service?.name || 'Unknown',
      serviceIcon: service?.icon || 'QuestionMark'
    };
  });
  
  res.json(bookingsWithDetails);
});

app.get('/api/bookings/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const booking = bookings.find(b => b.id === id);
  
  if (booking) {
    const provider = providers.find(p => p.id === booking.providerId);
    const user = users.find(u => u.id === provider.userId);
    const service = services.find(s => s.id === booking.serviceId);
    const customer = users.find(u => u.id === booking.customerId);
    
    const bookingWithDetails = {
      ...booking,
      providerName: user?.fullName || 'Unknown',
      providerEmail: user?.email || 'unknown@example.com',
      customerName: customer?.fullName || 'Unknown',
      customerEmail: customer?.email || 'unknown@example.com',
      serviceName: service?.name || 'Unknown',
      serviceIcon: service?.icon || 'QuestionMark'
    };
    
    res.json(bookingWithDetails);
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
});

app.post('/api/bookings', (req, res) => {
  const newBooking = {
    id: bookings.length + 1,
    ...req.body,
    status: 'pending',
  };
  
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  
  const booking = bookings.find(b => b.id === id);
  
  if (booking) {
    booking.status = status;
    res.json(booking);
  } else {
    res.status(404).json({ message: 'Booking not found' });
  }
});

// Serve the client as a static app
const clientDistPath = join(__dirname, 'client-standalone', 'dist');
const clientPublicPath = join(__dirname, 'client-standalone', 'public');
const clientFallbackPath = join(__dirname, 'client', 'dist');

// Determine which directory to serve static files from
let staticPath;
if (fs.existsSync(clientDistPath)) {
  staticPath = clientDistPath;
  console.log('Serving static files from client-standalone/dist');
} else if (fs.existsSync(clientPublicPath)) {
  staticPath = clientPublicPath;
  console.log('Serving static files from client-standalone/public');
} else if (fs.existsSync(clientFallbackPath)) {
  staticPath = clientFallbackPath;
  console.log('Serving static files from client/dist');
} else {
  staticPath = join(__dirname, 'public');
  // Create fallback public directory if it doesn't exist
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
          body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
          .header { background-color: #0ea5e9; color: white; padding: 2rem; border-radius: 0.5rem; margin-bottom: 2rem; }
          .card { background: white; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Service Match Pro</h1>
          <p>API server is running! The client app needs to be built.</p>
        </div>
        <div class="card">
          <h2>API Status</h2>
          <p>The API is working properly. Use the following endpoints:</p>
          <ul>
            <li><a href="/api/test">/api/test</a> - Test API connectivity</li>
            <li><a href="/api/services">/api/services</a> - Get all services</li>
            <li><a href="/api/providers">/api/providers</a> - Get all service providers</li>
          </ul>
        </div>
        <div class="card">
          <h2>Setup Instructions</h2>
          <p>To run the complete application:</p>
          <ol>
            <li>Build the client: <code>cd client-standalone && npm run build</code></li>
            <li>Restart this server</li>
          </ol>
        </div>
        <script>
          // Test API connection
          fetch('/api/test')
            .then(res => res.json())
            .then(data => {
              console.log('API test successful:', data);
            })
            .catch(err => {
              console.error('API test failed:', err);
            });
        </script>
      </body>
      </html>
    `);
  }
  console.log('Serving static files from fallback public directory');
}

app.use(express.static(staticPath));

// Handle SPA routes - serve index.html for all other routes
app.get('*', (req, res) => {
  const indexPath = join(staticPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Not found');
  }
});

// Create and start server
const server = createServer(app);
server.listen(port, '0.0.0.0', () => {
  console.log(`
=========================================
 Service Match Pro
=========================================
 Server running at: http://localhost:${port}
 API endpoint: http://localhost:${port}/api/test
=========================================
  `);
});