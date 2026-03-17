# Getting Started

## Prerequisites

- **Python 3.12+** (via pyenv or Homebrew)
- **Node.js 18+** (via Homebrew: `brew install node`)
- **Homebrew** (required for brew package scanning)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/ChadApplication/packagelist.git
cd packagelist
```

2. Run the setup script:

```bash
./setup.sh
```

This will:
- Verify Python, Node.js, and Homebrew are installed
- Create a Python virtual environment in `backend/venv/`
- Install backend dependencies from `backend/requirements.txt`
- Install frontend npm packages
- Create `frontend/.env.local` with the default backend port

## Running

Start both servers:

```bash
./run.sh start
```

The backend (FastAPI) runs on port 8020 and the frontend (Next.js) runs on port 3020 by default. If those ports are occupied, the script automatically finds the next free port using `lsof`.

Other commands:

```bash
./run.sh stop      # Stop all servers
./run.sh restart   # Stop then start
./run.sh status    # Show running status
./run.sh live      # Start + stream live logs
```

## First Use

1. Open http://localhost:3020 in your browser.
2. Click **Scan** to scan all installed packages.
3. Use the sidebar to filter by category, or the search bar to find packages by name, description, or memo.
