#!/bin/bash

# Stop on first error
set -e

# Move to the script's directory
cd "$(dirname "$0")"

echo "=============================================="
echo "  Starting Micro:bit Python Project Test Suite"
echo "=============================================="

# 1. Setup virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "[Step 1/4] Creating virtual environment..."
    python3 -m venv .venv
    .venv/bin/pip install --upgrade pip
fi

# 2. Sync dependencies
echo "[Step 2/4] Syncing dependencies..."
.venv/bin/pip install -r requirements.txt

# 3. Static Code Analysis (Lint)
echo ""
echo "[Step 3/4] Running Ruff Lint checks..."
.venv/bin/ruff check main.py tests/

# 4. Run Pytest Unit Tests
echo ""
echo "[Step 4/4] Running Pytest Unit Tests..."
.venv/bin/pytest

echo ""
echo "=============================================="
echo "  🎉 All Python tests completed successfully!"
echo "=============================================="
