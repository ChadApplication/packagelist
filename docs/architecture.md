# Architecture

PackageList is a local dashboard for monitoring and managing macOS packages. It uses a FastAPI backend and a Next.js frontend, communicating via REST API. There is no authentication and no database -- data is persisted as a single JSON file.

## Backend

**Stack:** Python 3.12 / FastAPI / Uvicorn

### Entry Point (`backend/main.py`)

The FastAPI app exposes 12 REST endpoints under `/api/`. It initializes a `PackageScanner` and a `PackageStore`, both used across all endpoints. CORS is fully open (`allow_origins=["*"]`) for local development.

### Scanner (`backend/services/scanner.py`)

`PackageScanner` scans four package sources in parallel using `asyncio.gather`:

- **Homebrew formulae** (`_scan_brew_formulae`): Runs `brew leaves` to get top-level formulae, then `brew info` on each to extract version, description, and homepage. Categories are auto-assigned by keyword matching in `_categorize_brew` (AI/LLM, Development, Search/Text, Terminal/System, Media/Image, Document/Presentation, Utility).
- **Homebrew casks** (`_scan_brew_casks`): Runs `brew list --cask`, then `brew info --cask` on each. All casks are categorized as "GUI App".
- **pip** (`_scan_pip`): Runs `pip list --format=json`, then batch-fetches descriptions and homepages via `pip show` (30 packages per batch). Categorized as "Python (pip)".
- **uv tools** (`_scan_uv_tools`): Runs `uv tool list`, parses name/version from output lines, then attempts `pip show` for descriptions. Categorized as "Python (uv tool)".

All subprocess calls run in `asyncio.to_thread` to avoid blocking the event loop, with configurable timeouts.

Update checking is also parallel: `check_outdated` runs `brew outdated --json=v2` and `pip list --outdated --format=json` concurrently.

### Store (`backend/services/store.py`)

`PackageStore` handles JSON file persistence at `backend/data/packages.json`.

Key behavior -- **memo and description preservation**: When saving, the store loads the existing file, builds a map of preserved keys (`memo`, `description_ko`, `description_zh`) keyed by `(source, name)`, and merges them into the new package list. This ensures user-entered memos and translated descriptions survive re-scans.

## Frontend

**Stack:** Next.js 15 / React 19 / TypeScript / Tailwind CSS

### Single Page App (`frontend/src/app/page.tsx`)

The entire UI is a single client-side React component (`"use client"`). It communicates with the backend via the Next.js rewrites proxy (configured to forward `/api/*` to the backend port).

### Layout

- **Header**: Title, package/update counts, language selector (EN/KO/ZH), Scan button, Check Updates button, Update All button, Expand/Collapse All toggle, CSV/MD export links.
- **Sidebar**: Search input (real-time filtering across name, description, memo) and category filter buttons with counts.
- **Main content**: Packages grouped by `source::category`, displayed in collapsible accordion sections. Each section expands into a table with columns: Name, Version, Description, Memo, Docs, Actions.
- **Footer**: Copyright and version (from `NEXT_PUBLIC_VERSION` env var or git tags).

### i18n System

Internationalization is implemented as an inline `i18n` object mapping language codes (`en`, `ko`, `zh`) to string keys. The current language is stored in React state. Category names are also translated via `cat:` prefixed keys.

For package descriptions, a dual-display mode shows the translated description (KO/ZH) with the original English description below it in smaller text. Clicking a description when a non-English language is active opens an inline editor for translation. Only `ko` and `zh` translations are supported (stored as `description_ko` and `description_zh` on each package).

### Category Auto-Classification

Categories are assigned server-side by the scanner. Brew formulae are classified by keyword matching against the package name and description. Brew casks default to "GUI App". Pip and uv-tool packages get their own fixed categories.
