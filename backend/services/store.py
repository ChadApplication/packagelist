import json
import os

PRESERVE_KEYS = ["memo", "description_ko", "description_zh"]


class PackageStore:
    def __init__(self, path: str):
        self.path = path

    def load(self) -> list[dict]:
        if not os.path.exists(self.path):
            return []
        try:
            with open(self.path, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []

    def save(self, packages: list[dict]):
        existing = {}
        for p in self.load():
            key = (p.get("source"), p.get("name"))
            existing[key] = {k: p.get(k, "") for k in PRESERVE_KEYS}

        for p in packages:
            key = (p.get("source"), p.get("name"))
            if key in existing:
                for k in PRESERVE_KEYS:
                    if existing[key].get(k) and not p.get(k):
                        p[k] = existing[key][k]

        os.makedirs(os.path.dirname(self.path), exist_ok=True)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(packages, f, ensure_ascii=False, indent=2)
