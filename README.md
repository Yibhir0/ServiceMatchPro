# Service Match Pro

A full-stack home service marketplace platform that connects customers with local service providers through an intelligent, user-centric matching system.

## Project Structure

This project is organized into two standalone components that can be run independently:

- `client-standalone/`: React frontend application 
- `server-standalone/`: Express.js backend API server

## Key Features

- Role-based authentication system (customer, service provider, admin)
- Service provider profiles with reviews, ratings, and verification
- Booking management system with status tracking
- Payment processing system
- Admin dashboard for platform management
- Search and filter functionality for finding service providers

## Running the Application

### Option 1: Super Quick Start (Recommended for Replit)

```bash
# Run the simplified all-in-one server
node go.js
```

### Option 2: Quick Start (Alternative for Replit)

```bash
# Run the simplified server that serves both backend and frontend
node replit-start.js
```

### Option 3: Running Both Client and Server Together

```bash
# Run both client and server concurrently
./start-standalone.sh
```

### Option 4: Running Client and Server Separately

```bash
# Start the server (in server-standalone directory)
cd server-standalone
npm install
node index.js

# In a separate terminal:
# Start the client (in client-standalone directory)
cd client-standalone
npm install
npm run dev
```

## Test Accounts

The application comes with pre-configured test accounts:

- **Customer**: username: `sarahsmith`, password: `pass123`
- **Service Provider**: username: `johnplumber`, password: `pass123`
- **Admin**: username: `admin`, password: `admin123`

## Technologies Used

- **Frontend**:
  - React.js
  - TanStack Query
  - Wouter (routing)
  - Tailwind CSS
  - Shadcn UI components

- **Backend**:
  - Node.js
  - Express.js
  - Passport.js (authentication)
  - In-memory database (for demo purposes)

## Development

### Client Development

The client application is built with React and uses:
- Vite for fast development and building
- Tailwind CSS for styling
- React Query for data fetching
- Wouter for client-side routing

### Server Development

The server provides RESTful APIs and handles:
- User authentication and authorization
- CRUD operations for users, service providers, bookings, etc.
- Data storage using an in-memory database (can be replaced with a persistent database)

## File Structure Explanation

- `client-standalone/`: Contains all frontend code
  - `src/`: React source code
    - `components/`: UI components
    - `hooks/`: Custom React hooks for auth, toast, etc.
    - `lib/`: Utility functions
    - `pages/`: All application pages
  - `public/`: Static assets
  - `vite.config.js`: Vite configuration
  - `server.js`: Simple server to serve the built client files

- `server-standalone/`: Contains all backend code
  - `src/`: Server source code
    - `auth.js`: Authentication setup
    - `routes.js`: API routes
    - `storage.js`: Data storage and manipulation
  - `index.js`: Main server file
  - `.env`: Environment variables

- `replit-start.js`: Simplified server script that combines both frontend and backend
- `go.js`: Super simple all-in-one script with minimal dependencies that runs everything

## License

MIT