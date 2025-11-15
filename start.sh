#!/bin/bash

echo "🚀 Starting Bookify Application..."
echo ""

# Kill any existing processes on ports 5001 and 8001
echo "🧹 Cleaning up old processes..."
lsof -i :5001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9 2>/dev/null || true
lsof -i :8001 | grep -v COMMAND | awk '{print $2}' | xargs kill -9 2>/dev/null || true
sleep 1

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found!"
    exit 1
fi

# Start backend
echo "📦 Starting Backend Server (Flask)..."
cd backend

# Create venv if it doesn't exist
if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install requirements
pip install -q -r requirements.txt 2>/dev/null

# Seed database if needed
if [ ! -f "instance/bookify.db" ] && [ ! -f "bookify.db" ]; then
    echo "🌱 Seeding database with sample books..."
    python seed_db.py
fi

# Start Flask server in background
python app.py > /tmp/bookify_backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend running on http://localhost:5001/api"
echo ""

# Return to root directory
cd ..

# Start frontend server
echo "🎨 Starting Frontend Server..."
echo "📍 Open browser and go to http://localhost:8001"
echo ""
echo "⚡ Bookify is ready! Press Ctrl+C to stop all servers"
echo ""

# Kill on interrupt
trap "kill $BACKEND_PID 2>/dev/null; exit" INT

python3 -m http.server 8001

# Clean up
kill $BACKEND_PID 2>/dev/null
