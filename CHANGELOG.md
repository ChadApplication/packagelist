# Changelog

## v0.0.2 (2026-03-17)

- R package scanning (490 packages via Rscript)
- Scan history: timestamped snapshots with CSV/MD download per entry
- Scan progress bar: SSE streaming with step-by-step UI (5 stages)
- Source ordering: Brew → pip → uv → R (custom sort)
- Multilingual docs (README, docs/ in EN/KO/ZH)

## v0.0.1 (2026-03-17)

- Initial release
- Package scanner (brew formulae/casks, pip, uv tools — parallel with descriptions)
- Dashboard UI (sidebar filter, collapsible groups, inline memo/description editing)
- Update checker + individual/bulk upgrade
- Manual/docs links for each package
- CSV and Markdown export
- Multilingual UI (EN/KO/ZH) + description translation with dual display
- Name sort (ascending/descending)
- Copyright footer with auto-version from git tags
- Port allocation: lsof-only (no stale file issue)
