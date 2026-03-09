#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  One-time setup script for Pet Nutrition AI
#  Run from project root: npm run setup
# ─────────────────────────────────────────────────────────────
set -e

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"

echo ""
echo "========================================"
echo "  Pet Nutrition AI — Project Setup"
echo "========================================"
echo ""

# ── 1. Create Python virtual environment ─────────────────────
echo "🐍 Setting up Python virtual environment..."
if [ -d "$BACKEND_DIR/.venv" ]; then
  echo "  ✅ venv already exists, skipping."
else
  cd "$BACKEND_DIR"
  python -m venv .venv
  echo "  ✅ venv created."
fi

# ── 2. Install Python dependencies ───────────────────────────
echo ""
echo "📦 Installing Python dependencies..."
cd "$BACKEND_DIR"

VENV_PIP="$BACKEND_DIR/.venv/Scripts/pip"
if [ ! -f "$VENV_PIP" ]; then
  VENV_PIP="$BACKEND_DIR/.venv/bin/pip"
fi

"$VENV_PIP" install --upgrade pip -q
"$VENV_PIP" install -r requirements.txt
echo "  ✅ Python dependencies installed."

# ── 3. Install root Node dependencies ────────────────────────
echo ""
echo "📦 Installing Node dependencies (concurrently)..."
cd "$ROOT_DIR"
npm install --silent
echo "  ✅ Node dependencies installed."

# ── 4. Install frontend dependencies ─────────────────────────
echo ""
echo "📦 Installing frontend dependencies..."
cd "$ROOT_DIR/frontend"
npm install --silent
echo "  ✅ Frontend dependencies installed."

# ── Done ──────────────────────────────────────────────────────
echo ""
echo "========================================"
echo "  ✅ Setup complete!"
echo ""
echo "  Run the project with:"
echo "    npm run dev"
echo ""
echo "  Frontend  → http://localhost:3000"
echo "  Backend   → http://localhost:8000"
echo "  API docs  → http://localhost:8000/docs"
echo "========================================"
echo ""
