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

- **Package Scan**: Parallel scanning of Homebrew (formulae + casks), pip, uv tools
- **Category Filter**: Auto-categorized (AI/LLM, Development, Terminal, Media, etc.)
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
| POST | /api/packages/scan | Full scan (brew + pip + uv) |
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

## Changelog

### v0.0.1 (2026-03-17)

- Initial release
- Package scanner (brew, pip, uv parallel scan with descriptions)
- Dashboard UI (sidebar filter, collapsible groups, inline memo/description editing)
- Update checker + individual/bulk upgrade
- Manual/docs links, CSV/MD export
- Multilingual UI (EN/KO/ZH) + description translation
- Name sort (asc/desc)
- Copyright footer with auto-version from git tags

## License

Copyright (c) chadchae
