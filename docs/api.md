# API Reference

All endpoints are prefixed with `/api`. The backend runs on port 8020 by default.

## Endpoints

### 1. Health Check

- **Method:** `GET`
- **Path:** `/api/health`
- **Description:** Returns server health status.
- **Response:** `{"status": "ok"}`

### 2. Scan Packages

- **Method:** `POST`
- **Path:** `/api/packages/scan`
- **Description:** Runs a full parallel scan of all package sources (Homebrew formulae, Homebrew casks, pip, uv tools). Results are saved to the JSON store.
- **Response:** `{"status": "ok", "count": <number>}`

### 3. List Packages

- **Method:** `GET`
- **Path:** `/api/packages`
- **Description:** Returns the stored package list with optional filtering.
- **Query Parameters:**
  - `category` (optional): Filter by category name (exact match).
  - `q` (optional): Search string matched against name, description, and memo (case-insensitive).
- **Response:** `{"packages": [...]}`

### 4. Get Categories

- **Method:** `GET`
- **Path:** `/api/packages/categories`
- **Description:** Returns distinct category names with package counts.
- **Response:** `{"categories": {"AI / LLM": 5, "Development": 12, ...}}`

### 5. Update Memo

- **Method:** `PUT`
- **Path:** `/api/packages/{source}/{name}/memo`
- **Description:** Updates the user memo for a specific package.
- **Path Parameters:**
  - `source`: Package source (e.g., `brew-formula`, `brew-cask`, `pip`, `uv-tool`).
  - `name`: Package name.
- **Request Body:** `{"memo": "<text>"}`
- **Response:** `{"status": "ok"}` or `{"status": "error", "message": "Package not found"}`

### 6. Update Localized Description

- **Method:** `PUT`
- **Path:** `/api/packages/{source}/{name}/description`
- **Description:** Updates a localized (translated) description for a package. Only `ko` and `zh` languages are accepted.
- **Path Parameters:**
  - `source`: Package source.
  - `name`: Package name.
- **Request Body:** `{"lang": "ko" | "zh", "text": "<translated description>"}`
- **Response:** `{"status": "ok"}` or `{"status": "error", "message": "..."}`

### 7. Check All Updates

- **Method:** `POST`
- **Path:** `/api/packages/check-updates`
- **Description:** Checks for outdated packages across all sources (brew formulae, brew casks, pip). Updates the `update_available` and `latest_version` fields in the store.
- **Response:** `{"status": "ok", "outdated_count": <number>}`

### 8. Check Single Package Update

- **Method:** `POST`
- **Path:** `/api/packages/{source}/{name}/check-update`
- **Description:** Checks whether a single package has an update available. Supports `brew-formula`, `brew-cask`, and `pip` sources.
- **Path Parameters:**
  - `source`: Package source.
  - `name`: Package name.
- **Response:** `{"status": "ok", "update_available": true|false, "latest": "<version>"}`

### 9. Upgrade Single Package

- **Method:** `POST`
- **Path:** `/api/packages/{source}/{name}/upgrade`
- **Description:** Upgrades a single package using the appropriate package manager (`brew upgrade`, `brew upgrade --cask`, or `pip install --upgrade`). Clears the update flag after completion.
- **Path Parameters:**
  - `source`: Package source.
  - `name`: Package name.
- **Response:** `{"status": "ok", "output": "<first 500 chars of command output>"}`

### 10. Upgrade All Outdated

- **Method:** `POST`
- **Path:** `/api/packages/upgrade-all`
- **Description:** Upgrades all outdated packages. Runs `brew upgrade` for all brew packages and `pip install --upgrade` for outdated pip packages. Clears all update flags.
- **Response:** `{"status": "ok", "upgraded": <number>}`

### 11. Get Manual/Documentation URL

- **Method:** `GET`
- **Path:** `/api/packages/{source}/{name}/manual`
- **Description:** Returns documentation URLs for a package. If the package has a homepage, returns it along with derived URLs (README, wiki for GitHub; PyPI link for pypi.org). Falls back to a Google search URL.
- **Path Parameters:**
  - `source`: Package source.
  - `name`: Package name.
- **Response:** `{"status": "ok", "urls": {"homepage": "...", "readme": "...", ...}}`

### 12. Export Packages

- **Method:** `GET`
- **Path:** `/api/packages/export`
- **Description:** Exports the full package list as a downloadable file. Packages are sorted by source, category, then name.
- **Query Parameters:**
  - `fmt` (optional, default `csv`): Export format. Values: `csv` or `md`.
- **Response:** File download (`text/csv` or `text/markdown`).
  - CSV columns: Source, Category, Name, Version, Description, Homepage, Memo, Update Available, Latest Version.
  - Markdown: Table with the same columns.
