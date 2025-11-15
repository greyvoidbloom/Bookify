@echo off
echo Starting Bookify Application...
echo.

if not exist backend (
    echo Error: backend directory not found!
    pause
    exit /b 1
)

echo Starting Backend Server (Flask)...
cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

pip install -q -r requirements.txt >nul 2>&1

if not exist bookify.db (
    echo Seeding database with sample books...
    python seed_db.py
)

start python app.py
echo Backend running on http://localhost:5000
echo.

cd ..

echo Starting Frontend Server...
echo Open browser and go to http://localhost:8000
echo.
echo Press Ctrl+C to stop the servers
echo.

python -m http.server 8000

pause
