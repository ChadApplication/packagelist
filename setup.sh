#!/bin/bash

# ==============================================================================
# PackageList - One-command Setup
# ==============================================================================
# Prerequisites: Python 3.12+, Node.js 18+, Homebrew
# Usage: ./setup.sh

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}PackageList Setup${NC}"
echo -e "${BLUE}=========================================${NC}"

# Check prerequisites
echo -e "\n${BLUE}Checking prerequisites...${NC}"

if ! command -v python3 &>/dev/null; then
    echo -e "${RED}ERROR: Python 3 not found. Install via pyenv or brew.${NC}"
    exit 1
fi

PY_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo -e "  Python: ${GREEN}${PY_VERSION}${NC}"

if ! command -v node &>/dev/null; then
    echo -e "${RED}ERROR: Node.js not found. Install via brew: brew install node${NC}"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "  Node.js: ${GREEN}${NODE_VERSION}${NC}"

if ! command -v brew &>/dev/null; then
    echo -e "${RED}WARNING: Homebrew not found. Brew package scanning will be unavailable.${NC}"
fi

# Backend setup
echo -e "\n${BLUE}Setting up backend...${NC}"
cd "$SCRIPT_DIR/backend"

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "  ${GREEN}Created Python venv${NC}"
fi

./venv/bin/pip install --upgrade pip -q 2>&1 | tail -1
./venv/bin/pip install -r requirements.txt -q 2>&1 | tail -1
echo -e "  ${GREEN}Dependencies installed${NC}"

# Frontend setup
echo -e "\n${BLUE}Setting up frontend...${NC}"
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
    npm install --silent 2>&1 | tail -3
    echo -e "  ${GREEN}npm packages installed${NC}"
else
    echo -e "  ${GREEN}node_modules already exists${NC}"
fi

# Create .env.local if missing
if [ ! -f ".env.local" ]; then
    echo "NEXT_PUBLIC_BACKEND_PORT=8020" > .env.local
    echo -e "  ${GREEN}Created .env.local${NC}"
fi

# Done
echo -e "\n${BLUE}=========================================${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "\nTo start:"
echo -e "  ${GREEN}./run.sh start${NC}"
echo -e "\nThen open:"
echo -e "  ${BLUE}http://localhost:3020${NC}"
echo -e "\nClick ${GREEN}Scan${NC} to scan your system packages."
