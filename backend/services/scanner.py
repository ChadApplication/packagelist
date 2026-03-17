import asyncio
import json
import subprocess
from typing import Optional


def _run(cmd: list[str], timeout: int = 30) -> str:
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return result.stdout.strip()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return ""


def _categorize_brew(name: str, desc: str) -> str:
    desc_lower = desc.lower()
    name_lower = name.lower()

    ai_keywords = ["llm", "whisper", "gemini", "ai", "model"]
    if any(k in name_lower or k in desc_lower for k in ai_keywords):
        return "AI / LLM"

    dev_keywords = ["compiler", "build", "cmake", "make", "git", "sdk", "lang", "java", "python", "go ", "rust"]
    if any(k in desc_lower for k in dev_keywords):
        return "Development"

    search_keywords = ["search", "grep", "find", "fuzzy", "json"]
    if any(k in desc_lower for k in search_keywords):
        return "Search / Text"

    term_keywords = ["terminal", "shell", "tmux", "monitor", "process", "file manager"]
    if any(k in desc_lower for k in term_keywords):
        return "Terminal / System"

    media_keywords = ["media", "image", "video", "audio", "music", "gif", "photo", "visual"]
    if any(k in desc_lower for k in media_keywords):
        return "Media / Image"

    doc_keywords = ["markdown", "document", "pdf", "presentation", "slide", "typeset", "convert"]
    if any(k in desc_lower for k in doc_keywords):
        return "Document / Presentation"

    return "Utility"


class PackageScanner:
    async def scan_all(self) -> list[dict]:
        """Scan all package sources in parallel."""
        results = await asyncio.gather(
            self._scan_brew_formulae(),
            self._scan_brew_casks(),
            self._scan_pip(),
            self._scan_uv_tools(),
        )
        packages = []
        for group in results:
            packages.extend(group)
        return packages

    async def _scan_brew_formulae(self) -> list[dict]:
        def _do():
            leaves = _run(["brew", "leaves"]).splitlines()
            packages = []
            for name in leaves:
                if not name.strip():
                    continue
                info_lines = _run(["brew", "info", name]).splitlines()
                version = ""
                desc = ""
                if len(info_lines) >= 1:
                    # First line: name: stable X.Y.Z
                    parts = info_lines[0].split()
                    for i, p in enumerate(parts):
                        if p == "stable":
                            version = parts[i + 1] if i + 1 < len(parts) else ""
                            break
                if len(info_lines) >= 2:
                    desc = info_lines[1]
                homepage = ""
                if len(info_lines) >= 3 and info_lines[2].startswith("http"):
                    homepage = info_lines[2]

                packages.append({
                    "name": name,
                    "version": version,
                    "description": desc,
                    "homepage": homepage,
                    "source": "brew-formula",
                    "category": _categorize_brew(name, desc),
                    "memo": "",
                    "update_available": False,
                })
            return packages
        return await asyncio.to_thread(_do)

    async def _scan_brew_casks(self) -> list[dict]:
        def _do():
            casks_raw = _run(["brew", "list", "--cask"])
            casks = casks_raw.splitlines()
            packages = []
            for name in casks:
                if not name.strip():
                    continue
                info_lines = _run(["brew", "info", "--cask", name]).splitlines()
                desc = ""
                version = ""
                if len(info_lines) >= 1:
                    parts = info_lines[0].split()
                    if len(parts) >= 2:
                        version = parts[-1]
                if len(info_lines) >= 2:
                    line2 = info_lines[1]
                    if line2.startswith("http"):
                        homepage = line2
                    else:
                        desc = line2
                        homepage = ""
                if not desc and len(info_lines) >= 2:
                    desc = info_lines[1] if not info_lines[1].startswith("http") else ""
                if not homepage:
                    for il in info_lines[:5]:
                        if il.startswith("http"):
                            homepage = il
                            break

                packages.append({
                    "name": name,
                    "version": version,
                    "description": desc,
                    "homepage": homepage,
                    "source": "brew-cask",
                    "category": "GUI App",
                    "memo": "",
                    "update_available": False,
                })
            return packages
        return await asyncio.to_thread(_do)

    async def _scan_pip(self) -> list[dict]:
        def _do():
            raw = _run(["pip", "list", "--format=json"], timeout=15)
            if not raw:
                return []
            try:
                pip_list = json.loads(raw)
            except json.JSONDecodeError:
                return []

            # Batch fetch descriptions via pip show
            names = [p.get("name", "") for p in pip_list if p.get("name")]
            desc_map: dict[str, tuple[str, str]] = {}  # name -> (summary, homepage)
            # Process in batches of 30 to avoid command line length limits
            for i in range(0, len(names), 30):
                batch = names[i:i+30]
                show_raw = _run(["pip", "show"] + batch, timeout=30)
                if show_raw:
                    current_name = ""
                    current_summary = ""
                    current_homepage = ""
                    for line in show_raw.splitlines():
                        if line.startswith("Name: "):
                            if current_name:
                                desc_map[current_name.lower()] = (current_summary, current_homepage)
                            current_name = line[6:].strip()
                            current_summary = ""
                            current_homepage = ""
                        elif line.startswith("Summary: "):
                            current_summary = line[9:].strip()
                        elif line.startswith("Home-page: "):
                            current_homepage = line[11:].strip()
                    if current_name:
                        desc_map[current_name.lower()] = (current_summary, current_homepage)

            packages = []
            for pkg in pip_list:
                pkg_name = pkg.get("name", "")
                info = desc_map.get(pkg_name.lower(), ("", ""))
                homepage = info[1] if info[1] else f"https://pypi.org/project/{pkg_name}/"
                packages.append({
                    "name": pkg_name,
                    "version": pkg.get("version", ""),
                    "description": info[0],
                    "homepage": homepage if pkg_name else "",
                    "source": "pip",
                    "category": "Python (pip)",
                    "memo": "",
                    "update_available": False,
                })
            return packages
        return await asyncio.to_thread(_do)

    async def _scan_uv_tools(self) -> list[dict]:
        def _do():
            raw = _run(["uv", "tool", "list"])
            if not raw:
                return []
            tool_list = []
            for line in raw.splitlines():
                if not line or line.startswith("-") or line.startswith(" "):
                    continue
                parts = line.split()
                if len(parts) >= 2:
                    tool_list.append({"name": parts[0], "version": parts[1].strip("v")})

            # Try pip show for descriptions
            names = [t["name"] for t in tool_list]
            desc_map: dict[str, tuple[str, str]] = {}
            if names:
                show_raw = _run(["pip", "show"] + names, timeout=15)
                if show_raw:
                    current_name = ""
                    current_summary = ""
                    current_homepage = ""
                    for line in show_raw.splitlines():
                        if line.startswith("Name: "):
                            if current_name:
                                desc_map[current_name.lower()] = (current_summary, current_homepage)
                            current_name = line[6:].strip()
                            current_summary = ""
                            current_homepage = ""
                        elif line.startswith("Summary: "):
                            current_summary = line[9:].strip()
                        elif line.startswith("Home-page: "):
                            current_homepage = line[11:].strip()
                    if current_name:
                        desc_map[current_name.lower()] = (current_summary, current_homepage)

            packages = []
            for t in tool_list:
                info = desc_map.get(t["name"].lower(), ("", ""))
                homepage = info[1] if info[1] else f"https://pypi.org/project/{t['name']}/"
                packages.append({
                    "name": t["name"],
                    "version": t["version"],
                    "description": info[0],
                    "homepage": homepage,
                    "source": "uv-tool",
                    "category": "Python (uv tool)",
                    "memo": "",
                    "update_available": False,
                })
            return packages
        return await asyncio.to_thread(_do)

    async def check_outdated(self) -> list[dict]:
        """Check for outdated packages across sources."""
        results = await asyncio.gather(
            self._check_brew_outdated(),
            self._check_pip_outdated(),
        )
        outdated = []
        for group in results:
            outdated.extend(group)
        return outdated

    async def _check_brew_outdated(self) -> list[dict]:
        def _do():
            raw = _run(["brew", "outdated", "--json=v2"], timeout=60)
            if not raw:
                return []
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                return []
            outdated = []
            for f in data.get("formulae", []):
                name = f.get("name", "")
                current = f.get("installed_versions", [""])[0] if f.get("installed_versions") else ""
                latest = f.get("current_version", "")
                outdated.append({"source": "brew-formula", "name": name, "current": current, "latest": latest})
            for c in data.get("casks", []):
                name = c.get("name", "")
                current = c.get("installed_versions", "")
                latest = c.get("current_version", "")
                outdated.append({"source": "brew-cask", "name": name, "current": current, "latest": latest})
            return outdated
        return await asyncio.to_thread(_do)

    async def _check_pip_outdated(self) -> list[dict]:
        def _do():
            raw = _run(["pip", "list", "--outdated", "--format=json"], timeout=60)
            if not raw:
                return []
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                return []
            return [
                {"source": "pip", "name": p["name"], "current": p.get("version", ""), "latest": p.get("latest_version", "")}
                for p in data
            ]
        return await asyncio.to_thread(_do)
