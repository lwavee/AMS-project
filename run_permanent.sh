#!/bin/bash
# AMS Enterprise System - Permanent Execution Supervisor for Linux
# Usage: chmod +x run_permanent.sh && ./run_permanent.sh

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$DIR"

mkdir -p logs

echo "================================================================"
echo "  AMS Enterprise System - Permanent Linux Server Supervisor"
echo "================================================================"

# Check for Python virtual environment
PYTHON_BIN="$DIR/backend/venv/bin/python3"
UVICORN_BIN="$DIR/backend/venv/bin/uvicorn"
if [ ! -f "$UVICORN_BIN" ]; then
    UVICORN_BIN="uvicorn"
fi

# Function to run backend in continuous loop
run_backend() {
    while true; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting FastAPI Backend..."
        cd "$DIR/backend"
        $UVICORN_BIN app.main:app --host 0.0.0.0 --port 8000 --workers 2 >> "$DIR/logs/backend.log" 2>&1 || true
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ALERT] Backend stopped. Auto-restarting in 2s..." >> "$DIR/logs/backend.log"
        sleep 2
    done
}

# Function to run frontend in continuous loop
run_frontend() {
    while true; do
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting Next.js Frontend..."
        cd "$DIR/frontend"
        npm start >> "$DIR/logs/frontend.log" 2>&1 || npm run dev >> "$DIR/logs/frontend.log" 2>&1 || true
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ALERT] Frontend stopped. Auto-restarting in 2s..." >> "$DIR/logs/frontend.log"
        sleep 2
    done
}

# Trap SIGINT and SIGTERM to kill background jobs cleanly
cleanup() {
    echo "Stopping AMS services..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

echo "Launching backend supervisor in background..."
run_backend &
BACKEND_PID=$!

echo "Launching frontend supervisor in background..."
run_frontend &
FRONTEND_PID=$!

echo "Both services are active! Monitoring processes (PIDs: $BACKEND_PID, $FRONTEND_PID)..."
echo "Check logs at: logs/backend.log and logs/frontend.log"

wait
