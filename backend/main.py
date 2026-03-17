from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from services.scanner import PackageScanner
from services.store import PackageStore
from pydantic import BaseModel
from typing import Optional
import asyncio
import csv
import io
import os
import subprocess

app = FastAPI(title="PackageList API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

scanner = PackageScanner()
store = PackageStore(os.path.join(DATA_DIR, "packages.json"))


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/packages/scan")
async def scan_packages():
    """Run a full scan of all package sources."""
    packages = await scanner.scan_all()
    store.save(packages)
    return {"status": "ok", "count": len(packages)}


@app.get("/api/packages")
def get_packages(category: Optional[str] = None, q: Optional[str] = None):
    """Get stored package list with optional filtering."""
    packages = store.load()
    if category:
        packages = [p for p in packages if p.get("category") == category]
    if q:
        q_lower = q.lower()
        packages = [
            p for p in packages
            if q_lower in p.get("name", "").lower()
            or q_lower in p.get("description", "").lower()
            or q_lower in p.get("memo", "").lower()
        ]
    return {"packages": packages}


@app.get("/api/packages/categories")
def get_categories():
    """Get distinct categories with counts."""
    packages = store.load()
    counts: dict[str, int] = {}
    for p in packages:
        cat = p.get("category", "unknown")
        counts[cat] = counts.get(cat, 0) + 1
    return {"categories": counts}


class MemoRequest(BaseModel):
    memo: str


class DescriptionRequest(BaseModel):
    lang: str
    text: str


@app.put("/api/packages/{source}/{name}/memo")
def update_memo(source: str, name: str, req: MemoRequest):
    """Update user memo for a specific package."""
    packages = store.load()
    found = False
    for p in packages:
        if p.get("source") == source and p.get("name") == name:
            p["memo"] = req.memo
            found = True
            break
    if not found:
        return {"status": "error", "message": "Package not found"}
    store.save(packages)
    return {"status": "ok"}


@app.put("/api/packages/{source}/{name}/description")
def update_description(source: str, name: str, req: DescriptionRequest):
    """Update localized description for a package."""
    if req.lang not in ("ko", "zh"):
        return {"status": "error", "message": "Only ko and zh supported"}
    packages = store.load()
    found = False
    for p in packages:
        if p.get("source") == source and p.get("name") == name:
            p[f"description_{req.lang}"] = req.text
            found = True
            break
    if not found:
        return {"status": "error", "message": "Package not found"}
    store.save(packages)
    return {"status": "ok"}


@app.post("/api/packages/check-updates")
async def check_updates():
    """Check for outdated packages."""
    outdated = await scanner.check_outdated()
    packages = store.load()
    outdated_map = {(o["source"], o["name"]): o for o in outdated}
    for p in packages:
        key = (p.get("source"), p.get("name"))
        if key in outdated_map:
            p["latest_version"] = outdated_map[key].get("latest")
            p["update_available"] = True
        else:
            p["update_available"] = False
            p.pop("latest_version", None)
    store.save(packages)
    return {"status": "ok", "outdated_count": len(outdated)}


@app.get("/api/packages/export")
def export_packages(fmt: str = "csv"):
    """Export packages as CSV or Markdown."""
    packages = store.load()
    if fmt == "md":
        lines = ["# Package List\n"]
        lines.append("| Source | Category | Name | Version | Description | Homepage | Memo | Update |")
        lines.append("|--------|----------|------|---------|-------------|----------|------|--------|")
        for p in sorted(packages, key=lambda x: (x.get("source", ""), x.get("category", ""), x.get("name", ""))):
            upd = f"→ {p['latest_version']}" if p.get("update_available") else ""
            lines.append(
                f"| {p.get('source','')} | {p.get('category','')} | {p.get('name','')} | "
                f"{p.get('version','')} | {p.get('description','')} | {p.get('homepage','')} | "
                f"{p.get('memo','')} | {upd} |"
            )
        content = "\n".join(lines)
        return StreamingResponse(
            io.BytesIO(content.encode("utf-8")),
            media_type="text/markdown",
            headers={"Content-Disposition": "attachment; filename=packages.md"},
        )
    else:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Source", "Category", "Name", "Version", "Description", "Homepage", "Memo", "Update Available", "Latest Version"])
        for p in sorted(packages, key=lambda x: (x.get("source", ""), x.get("category", ""), x.get("name", ""))):
            writer.writerow([
                p.get("source", ""), p.get("category", ""), p.get("name", ""),
                p.get("version", ""), p.get("description", ""), p.get("homepage", ""),
                p.get("memo", ""), p.get("update_available", False), p.get("latest_version", ""),
            ])
        content = output.getvalue()
        return StreamingResponse(
            io.BytesIO(content.encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=packages.csv"},
        )


def _run_cmd(cmd: list[str], timeout: int = 30) -> str:
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return r.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return ""


@app.post("/api/packages/{source}/{name}/check-update")
async def check_single_update(source: str, name: str):
    """Check if a single package has an update available."""
    def _do():
        if source == "brew-formula":
            raw = _run_cmd(["brew", "outdated", "--json=v2"], timeout=60)
            if raw:
                import json
                data = json.loads(raw)
                for f in data.get("formulae", []):
                    if f.get("name") == name:
                        return {"update_available": True, "latest": f.get("current_version", "")}
            return {"update_available": False}
        elif source == "brew-cask":
            raw = _run_cmd(["brew", "outdated", "--cask", "--json=v2"], timeout=60)
            if raw:
                import json
                data = json.loads(raw)
                for c in data.get("casks", []):
                    if c.get("name") == name:
                        return {"update_available": True, "latest": c.get("current_version", "")}
            return {"update_available": False}
        elif source == "pip":
            raw = _run_cmd(["pip", "list", "--outdated", "--format=json"], timeout=60)
            if raw:
                import json
                for p in json.loads(raw):
                    if p.get("name") == name:
                        return {"update_available": True, "latest": p.get("latest_version", "")}
            return {"update_available": False}
        return {"update_available": False}

    result = await asyncio.to_thread(_do)
    # Update store
    packages = store.load()
    for p in packages:
        if p.get("source") == source and p.get("name") == name:
            p["update_available"] = result["update_available"]
            if result.get("latest"):
                p["latest_version"] = result["latest"]
            break
    store.save(packages)
    return {"status": "ok", **result}


@app.post("/api/packages/{source}/{name}/upgrade")
async def upgrade_package(source: str, name: str):
    """Upgrade a single package."""
    def _do():
        if source == "brew-formula":
            out = _run_cmd(["brew", "upgrade", name], timeout=120)
            return out or "Done"
        elif source == "brew-cask":
            out = _run_cmd(["brew", "upgrade", "--cask", name], timeout=120)
            return out or "Done"
        elif source == "pip":
            out = _run_cmd(["pip", "install", "--upgrade", name], timeout=120)
            return out or "Done"
        return "Unsupported source"

    output = await asyncio.to_thread(_do)
    # Clear update flag
    packages = store.load()
    for p in packages:
        if p.get("source") == source and p.get("name") == name:
            p["update_available"] = False
            p.pop("latest_version", None)
            break
    store.save(packages)
    return {"status": "ok", "output": output[:500]}


@app.post("/api/packages/upgrade-all")
async def upgrade_all():
    """Upgrade all outdated packages."""
    packages = store.load()
    outdated = [p for p in packages if p.get("update_available")]
    if not outdated:
        return {"status": "ok", "upgraded": 0}

    def _do():
        # Brew upgrade all
        _run_cmd(["brew", "upgrade"], timeout=300)
        # Pip upgrade outdated
        pip_outdated = [p["name"] for p in outdated if p.get("source") == "pip"]
        if pip_outdated:
            _run_cmd(["pip", "install", "--upgrade"] + pip_outdated, timeout=300)
        return len(outdated)

    count = await asyncio.to_thread(_do)
    # Clear all update flags
    for p in packages:
        p["update_available"] = False
        p.pop("latest_version", None)
    store.save(packages)
    return {"status": "ok", "upgraded": count}


@app.get("/api/packages/{source}/{name}/manual")
def get_manual_url(source: str, name: str):
    """Get manual/documentation URL for a package."""
    packages = store.load()
    for p in packages:
        if p.get("source") == source and p.get("name") == name:
            homepage = p.get("homepage", "")
            if homepage:
                # Try to derive doc URLs
                urls = {"homepage": homepage}
                if "github.com" in homepage:
                    urls["readme"] = homepage + "#readme"
                    urls["wiki"] = homepage + "/wiki"
                elif "pypi.org" in homepage:
                    urls["pypi"] = homepage
                return {"status": "ok", "urls": urls}
            # Fallback: generate search URL
            return {"status": "ok", "urls": {
                "search": f"https://www.google.com/search?q={name}+documentation",
            }}
    return {"status": "error", "message": "Package not found"}
