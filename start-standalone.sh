#!/bin/bash
# This script starts both the client and server for Service Match Pro

# Build the client
echo "Building the client..."
cd client-standalone
npm run build

# Start the server
echo "Starting the server..."
cd ../server-standalone
node index.js &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait a bit for the server to start
sleep 3

# Start the client server to serve the built files
echo "Starting the client server..."
cd ../client-standalone
node server.js &
CLIENT_PID=$!
echo "Client started with PID: $CLIENT_PID"

# Function to handle script exit
cleanup() {
  echo "Shutting down servers..."
  kill $SERVER_PID
  kill $CLIENT_PID
  exit 0
}

# Set up trap to catch script termination
trap cleanup SIGINT SIGTERM

# Keep the script running
echo "Both servers are now running."
echo "API Server: http://localhost:3000"
echo "Client: http://localhost:5173"
echo "Press Ctrl+C to stop."
while true; do
  sleep 1
done