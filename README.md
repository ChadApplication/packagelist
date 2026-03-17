# PackageList

Local dashboard for monitoring and managing installed packages on macOS — Homebrew formulae/casks, Python pip, uv tools.

## Prerequisites

- Python 3.12+
- Node.js 18+
- Homebrew

## Installation

```bash
git clone https://github.com/ChadApplication/packagelist.git
cd packagelist
./setup.sh
```

## Usage

```bash
./run.sh start    # Start servers (Backend :8020, Frontend :3020)
./run.sh stop     # Stop servers
./run.sh restart  # Restart
./run.sh live     # Start + live log streaming
```

Open http://localhost:3020 and click **Scan**.

## Features

- **Package Scan**: Parallel scanning of Homebrew (formulae + casks), pip, uv tools, R packages
- **Scan Progress Bar**: Real-time SSE streaming with step-by-step progress (5 stages)
- **Scan History**: Timestamped snapshots with per-entry CSV/MD download
- **Category Filter**: Auto-categorized (AI/LLM, Development, Terminal, Media, R, etc.)
- **Source Ordering**: Brew → pip → uv → R (custom sort)
- **Search**: Real-time search across name, description (multilingual), memo
- **Sort**: Name ascending/descending toggle
- **Memo**: Per-package notes, preserved across re-scans
- **Multilingual Description**: EN/KO/ZH — click description to edit translation
- **Update Check**: Detect outdated packages, individual or bulk update
- **Manual/Docs**: One-click open homepage for each package
- **Export**: CSV and Markdown download
- **Multilingual UI**: EN / KO / ZH interface switching

## Tech Stack

- **Backend:** Python 3.12 / FastAPI
- **Frontend:** Next.js 15 / React 19 / TypeScript / Tailwind CSS
- **Storage:** JSON file (no database)

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/packages/scan | Full scan (brew + pip + uv + R) |
| GET | /api/packages/scan-stream | SSE scan with progress streaming |
| GET | /api/packages | List packages (?category=, ?q=) |
| GET | /api/packages/categories | Category counts |
| PUT | /api/packages/{source}/{name}/memo | Update memo |
| PUT | /api/packages/{source}/{name}/description | Update localized description |
| POST | /api/packages/check-updates | Check all outdated packages |
| POST | /api/packages/{source}/{name}/check-update | Check single package |
| POST | /api/packages/{source}/{name}/upgrade | Upgrade single package |
| POST | /api/packages/upgrade-all | Upgrade all outdated |
| GET | /api/packages/{source}/{name}/manual | Get documentation URLs |
| GET | /api/packages/export | Export CSV or Markdown (?fmt=csv/md) |
| GET | /api/packages/history | List scan snapshots |
| GET | /api/packages/history/{id}/{fmt} | Download snapshot (csv/md/json) |

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history.

## License

Copyright (c) chadchae
