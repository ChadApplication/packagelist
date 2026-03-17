"use client";

import { useEffect, useState, useMemo } from "react";
import { Package, RefreshCw, Search, ArrowUpCircle, ChevronRight, ChevronDown, Edit3, Check, X, Globe, ChevronsUpDown, Download, ExternalLink, BookOpen, RotateCw, ArrowUpAZ, ArrowDownAZ } from "lucide-react";
import toast from "react-hot-toast";

type Lang = "en" | "ko" | "zh";

const i18n: Record<Lang, Record<string, string>> = {
  en: {
    title: "PackageList",
    packages: "packages",
    updates: "updates",
    scan: "Scan",
    scanning: "Scanning...",
    checkUpdates: "Check Updates",
    checking: "Checking...",
    search: "Search...",
    all: "All",
    noPackages: "No packages scanned yet",
    firstScan: "Run First Scan",
    loading: "Loading...",
    name: "Name",
    version: "Version",
    description: "Description",
    memo: "memo",
    scanned: "Scanned {n} packages",
    scanFailed: "Scan failed",
    updatesAvailable: "{n} updates available",
    updateFailed: "Update check failed",
    memoFailed: "Failed to save memo",
    expandAll: "Expand All",
    collapseAll: "Collapse All",
    exportCSV: "CSV",
    exportMD: "MD",
    manual: "Docs",
    actions: "Actions",
    update: "Update",
    updateAll: "Update All",
    updating: "Updating...",
    upgraded: "Updated {n} packages",
    upgradeFailed: "Update failed",
    notRunning: "Frontend not running",
    noSelection: "No running projects selected",
    "cat:AI / LLM": "AI / LLM",
    "cat:Development": "Development",
    "cat:Search / Text": "Search / Text",
    "cat:Terminal / System": "Terminal / System",
    "cat:Media / Image": "Media / Image",
    "cat:Document / Presentation": "Document / Presentation",
    "cat:GUI App": "GUI App",
    "cat:Python (pip)": "Python (pip)",
    "cat:Python (uv tool)": "Python (uv tool)",
    "cat:Utility": "Utility",
  },
  ko: {
    title: "패키지 목록",
    packages: "개 패키지",
    updates: "개 업데이트",
    scan: "스캔",
    scanning: "스캔 중...",
    checkUpdates: "업데이트 확인",
    checking: "확인 중...",
    search: "검색...",
    all: "전체",
    noPackages: "스캔된 패키지가 없습니다",
    firstScan: "첫 스캔 실행",
    loading: "로딩 중...",
    name: "이름",
    version: "버전",
    description: "설명",
    memo: "메모",
    scanned: "{n}개 패키지 스캔 완료",
    scanFailed: "스캔 실패",
    updatesAvailable: "{n}개 업데이트 가능",
    updateFailed: "업데이트 확인 실패",
    memoFailed: "메모 저장 실패",
    expandAll: "모두 펼치기",
    collapseAll: "모두 접기",
    exportCSV: "CSV",
    exportMD: "MD",
    manual: "문서",
    actions: "작업",
    update: "업데이트",
    updateAll: "전체 업데이트",
    updating: "업데이트 중...",
    upgraded: "{n}개 패키지 업데이트 완료",
    upgradeFailed: "업데이트 실패",
    notRunning: "프론트엔드 미실행",
    noSelection: "실행 중인 프로젝트 미선택",
    "cat:AI / LLM": "AI / LLM",
    "cat:Development": "개발 도구",
    "cat:Search / Text": "검색 / 텍스트",
    "cat:Terminal / System": "터미널 / 시스템",
    "cat:Media / Image": "미디어 / 이미지",
    "cat:Document / Presentation": "문서 / 프레젠테이션",
    "cat:GUI App": "GUI 앱",
    "cat:Python (pip)": "Python (pip)",
    "cat:Python (uv tool)": "Python (uv tool)",
    "cat:Utility": "유틸리티",
  },
  zh: {
    title: "软件包列表",
    packages: "个软件包",
    updates: "个更新",
    scan: "扫描",
    scanning: "扫描中...",
    checkUpdates: "检查更新",
    checking: "检查中...",
    search: "搜索...",
    all: "全部",
    noPackages: "尚未扫描任何软件包",
    firstScan: "执行首次扫描",
    loading: "加载中...",
    name: "名称",
    version: "版本",
    description: "描述",
    memo: "备注",
    scanned: "已扫描 {n} 个软件包",
    scanFailed: "扫描失败",
    updatesAvailable: "{n} 个更新可用",
    updateFailed: "更新检查失败",
    memoFailed: "备注保存失败",
    expandAll: "全部展开",
    collapseAll: "全部折叠",
    exportCSV: "CSV",
    exportMD: "MD",
    manual: "文档",
    actions: "操作",
    update: "更新",
    updateAll: "全部更新",
    updating: "更新中...",
    upgraded: "已更新 {n} 个软件包",
    upgradeFailed: "更新失败",
    notRunning: "前端未运行",
    noSelection: "未选择运行中的项目",
    "cat:AI / LLM": "AI / 大模型",
    "cat:Development": "开发工具",
    "cat:Search / Text": "搜索 / 文本",
    "cat:Terminal / System": "终端 / 系统",
    "cat:Media / Image": "媒体 / 图像",
    "cat:Document / Presentation": "文档 / 演示",
    "cat:GUI App": "GUI 应用",
    "cat:Python (pip)": "Python (pip)",
    "cat:Python (uv tool)": "Python (uv tool)",
    "cat:Utility": "实用工具",
  },
};

interface PackageInfo {
  name: string;
  version: string;
  description: string;
  description_ko?: string;
  description_zh?: string;
  homepage?: string;
  source: string;
  category: string;
  memo: string;
  update_available?: boolean;
  latest_version?: string;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const t = i18n[lang];
  const [packages, setPackages] = useState<PackageInfo[]>([]);
  const [categories, setCategories] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [editingMemo, setEditingMemo] = useState<string | null>(null);
  const [memoValue, setMemoValue] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [upgrading, setUpgrading] = useState<Set<string>>(new Set());
  const [checkingSingle, setCheckingSingle] = useState<Set<string>>(new Set());
  const [editingDesc, setEditingDesc] = useState<string | null>(null);
  const [descValue, setDescValue] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      setPackages(data.packages || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/packages/categories");
      const data = await res.json();
      setCategories(data.categories || {});
    } catch { /* ignore */ }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/packages/scan", { method: "POST" });
      const data = await res.json();
      toast.success(t.scanned.replace("{n}", data.count));
      await fetchPackages();
      await fetchCategories();
    } catch {
      toast.error(t.scanFailed);
    } finally {
      setScanning(false);
    }
  };

  const handleCheckUpdates = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/packages/check-updates", { method: "POST" });
      const data = await res.json();
      toast.success(t.updatesAvailable.replace("{n}", data.outdated_count));
      await fetchPackages();
    } catch {
      toast.error(t.updateFailed);
    } finally {
      setChecking(false);
    }
  };

  const handleUpgradeAll = async () => {
    setUpgrading(new Set(["__all__"]));
    try {
      const res = await fetch("/api/packages/upgrade-all", { method: "POST" });
      const data = await res.json();
      toast.success(t.upgraded.replace("{n}", data.upgraded));
      await fetchPackages();
    } catch {
      toast.error(t.upgradeFailed);
    } finally {
      setUpgrading(new Set());
    }
  };

  const handleUpgradeSingle = async (source: string, name: string) => {
    const key = `${source}::${name}`;
    setUpgrading(prev => new Set([...prev, key]));
    try {
      await fetch(`/api/packages/${source}/${name}/upgrade`, { method: "POST" });
      setPackages(prev => prev.map(p =>
        p.source === source && p.name === name ? { ...p, update_available: false, latest_version: undefined } : p
      ));
      toast.success(`${name} updated`);
    } catch {
      toast.error(t.upgradeFailed);
    } finally {
      setUpgrading(prev => { const n = new Set(prev); n.delete(key); return n; });
    }
  };

  const handleCheckSingle = async (source: string, name: string) => {
    const key = `${source}::${name}`;
    setCheckingSingle(prev => new Set([...prev, key]));
    try {
      const res = await fetch(`/api/packages/${source}/${name}/check-update`, { method: "POST" });
      const data = await res.json();
      setPackages(prev => prev.map(p =>
        p.source === source && p.name === name
          ? { ...p, update_available: data.update_available, latest_version: data.latest || undefined }
          : p
      ));
      if (data.update_available) {
        toast.success(`${name}: ${data.latest} available`);
      } else {
        toast(`${name}: up to date`, { icon: "✓" });
      }
    } catch {
      toast.error(t.updateFailed);
    } finally {
      setCheckingSingle(prev => { const n = new Set(prev); n.delete(key); return n; });
    }
  };

  const openManual = async (source: string, name: string) => {
    try {
      const res = await fetch(`/api/packages/${source}/${name}/manual`);
      const data = await res.json();
      if (data.urls) {
        const url = data.urls.homepage || data.urls.readme || data.urls.pypi || data.urls.search;
        if (url) window.open(url, "_blank");
      }
    } catch { /* ignore */ }
  };

  const getDesc = (p: PackageInfo): { localized: string; original: string } => {
    const original = p.description || "";
    if (lang === "ko" && p.description_ko) return { localized: p.description_ko, original };
    if (lang === "zh" && p.description_zh) return { localized: p.description_zh, original };
    return { localized: "", original };
  };

  const handleSaveDesc = async (source: string, name: string) => {
    const descLang = lang === "ko" ? "ko" : lang === "zh" ? "zh" : "";
    if (!descLang) { setEditingDesc(null); return; }
    try {
      await fetch(`/api/packages/${source}/${name}/description`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: descLang, text: descValue }),
      });
      setPackages(prev =>
        prev.map(p =>
          p.source === source && p.name === name
            ? { ...p, [`description_${descLang}`]: descValue }
            : p
        )
      );
      setEditingDesc(null);
    } catch {
      toast.error("Failed to save description");
    }
  };

  const handleSaveMemo = async (source: string, name: string) => {
    try {
      await fetch(`/api/packages/${source}/${name}/memo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo: memoValue }),
      });
      setPackages(prev =>
        prev.map(p =>
          p.source === source && p.name === name ? { ...p, memo: memoValue } : p
        )
      );
      setEditingMemo(null);
    } catch {
      toast.error(t.memoFailed);
    }
  };

  useEffect(() => {
    fetchPackages();
    fetchCategories();
  }, []);

  const filtered = useMemo(() => {
    let result = packages;
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.description_ko || "").toLowerCase().includes(q) ||
          (p.description_zh || "").toLowerCase().includes(q) ||
          p.memo.toLowerCase().includes(q)
      );
    }
    return result;
  }, [packages, selectedCategory, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, PackageInfo[]> = {};
    for (const p of filtered) {
      const key = `${p.source}::${p.category}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    const mult = sortOrder === "asc" ? 1 : -1;
    for (const pkgs of Object.values(groups)) {
      pkgs.sort((a, b) => mult * a.name.localeCompare(b.name));
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered, sortOrder]);

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const sourceLabel = (source: string) => {
    switch (source) {
      case "brew-formula": return "Homebrew";
      case "brew-cask": return "Homebrew Cask";
      case "pip": return "Python (pip)";
      case "uv-tool": return "Python (uv)";
      default: return source;
    }
  };

  const catLabel = (cat: string) => t[`cat:${cat}`] || cat;

  const allGroupKeys = grouped.map(([key]) => key);
  const allExpanded = allGroupKeys.length > 0 && allGroupKeys.every(k => expandedCategories.has(k));

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(allGroupKeys));
    }
  };

  const updatableCount = packages.filter(p => p.update_available).length;
  const totalCount = packages.length;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold">{t.title}</h1>
            {totalCount > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totalCount} {t.packages}
                {updatableCount > 0 && (
                  <span className="ml-2 text-orange-500">{updatableCount} {t.updates}</span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="flex items-center gap-1 mr-2">
              <Globe className="w-4 h-4 text-gray-400" />
              {(["en", "ko", "zh"] as Lang[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-1.5 py-0.5 text-xs rounded ${
                    lang === l
                      ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  }`}
                >
                  {l === "en" ? "EN" : l === "ko" ? "KO" : "ZH"}
                </button>
              ))}
            </div>
            <button
              onClick={handleScan}
              disabled={scanning}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
              {scanning ? t.scanning : t.scan}
            </button>
            <button
              onClick={handleCheckUpdates}
              disabled={checking}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50"
            >
              <ArrowUpCircle className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
              {checking ? t.checking : t.checkUpdates}
            </button>
            {updatableCount > 0 && (
              <button
                onClick={handleUpgradeAll}
                disabled={upgrading.has("__all__")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50"
              >
                <RotateCw className={`w-4 h-4 ${upgrading.has("__all__") ? "animate-spin" : ""}`} />
                {upgrading.has("__all__") ? t.updating : t.updateAll} ({updatableCount})
              </button>
            )}
            {totalCount > 0 && (
              <button
                onClick={toggleAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-neutral-700"
              >
                <ChevronsUpDown className="w-4 h-4" />
                {allExpanded ? t.collapseAll : t.expandAll}
              </button>
            )}
            {totalCount > 0 && (
              <div className="flex items-center gap-1 ml-1">
                <Download className="w-4 h-4 text-gray-400" />
                <a
                  href="/api/packages/export?fmt=csv"
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-neutral-800 rounded hover:bg-gray-200 dark:hover:bg-neutral-700"
                >
                  {t.exportCSV}
                </a>
                <a
                  href="/api/packages/export?fmt=md"
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-neutral-800 rounded hover:bg-gray-200 dark:hover:bg-neutral-700"
                >
                  {t.exportMD}
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 flex gap-4">
        {/* Sidebar */}
        <aside className="w-56 shrink-0">
          <div className="sticky top-16 space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={t.search}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category filter */}
            <nav className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left px-3 py-2 text-sm flex justify-between ${
                  !selectedCategory ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium" : "hover:bg-gray-50 dark:hover:bg-neutral-800"
                }`}
              >
                <span>{t.all}</span>
                <span className="text-gray-400">{totalCount}</span>
              </button>
              {Object.entries(categories)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
                    className={`w-full text-left px-3 py-2 text-sm flex justify-between border-t border-gray-100 dark:border-neutral-800 ${
                      selectedCategory === cat
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
                        : "hover:bg-gray-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <span className="truncate">{catLabel(cat)}</span>
                    <span className="text-gray-400 ml-2">{count}</span>
                  </button>
                ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {loading && packages.length === 0 ? (
            <div className="text-center py-20 text-gray-400">{t.loading}</div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">{t.noPackages}</p>
              <button
                onClick={handleScan}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t.firstScan}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {grouped.map(([key, pkgs]) => {
                const [source, category] = key.split("::");
                const isExpanded = expandedCategories.has(key);
                const groupKey = key;
                return (
                  <div key={groupKey} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                    {/* Group header */}
                    <button
                      onClick={() => toggleCategory(groupKey)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-neutral-800"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span className="font-medium text-sm">{catLabel(category)}</span>
                        <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-100 dark:bg-neutral-800 rounded">
                          {sourceLabel(source)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{pkgs.length}</span>
                    </button>

                    {/* Package list */}
                    {isExpanded && (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-t border-gray-100 dark:border-neutral-800 text-xs text-gray-400 uppercase">
                            <th className="text-left px-4 py-2 font-medium w-44">
                              <button
                                onClick={() => setSortOrder(prev => prev === "asc" ? "desc" : "asc")}
                                className="inline-flex items-center gap-1 hover:text-blue-500"
                              >
                                {t.name}
                                {sortOrder === "asc"
                                  ? <ArrowUpAZ className="w-3.5 h-3.5" />
                                  : <ArrowDownAZ className="w-3.5 h-3.5" />
                                }
                              </button>
                            </th>
                            <th className="text-left px-4 py-2 font-medium w-20">{t.version}</th>
                            <th className="text-left px-4 py-2 font-medium">{t.description}</th>
                            <th className="text-left px-4 py-2 font-medium w-40">{t.memo}</th>
                            <th className="text-center px-2 py-2 font-medium w-12">{t.manual}</th>
                            <th className="text-center px-2 py-2 font-medium w-24">{t.actions}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pkgs.map(p => {
                            const memoKey = `${p.source}::${p.name}`;
                            const isEditingThis = editingMemo === memoKey;
                            return (
                              <tr
                                key={memoKey}
                                className="border-t border-gray-50 dark:border-neutral-800/50 hover:bg-gray-50/50 dark:hover:bg-neutral-800/30"
                              >
                                <td className="px-4 py-1.5 font-mono text-xs">
                                  <span className="inline-flex items-center gap-1">
                                    {p.name}
                                    {p.homepage && (
                                      <a
                                        href={p.homepage}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-600"
                                        title={p.homepage}
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                    {p.update_available && (
                                      <span className="text-orange-500 text-[10px]" title={`Update: ${p.latest_version}`}>
                                        ↑{p.latest_version}
                                      </span>
                                    )}
                                  </span>
                                </td>
                                <td className="px-4 py-1.5 text-gray-500 text-xs font-mono">{p.version}</td>
                                <td className="px-4 py-1.5 text-xs max-w-xs">
                                  {editingDesc === memoKey ? (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        value={descValue}
                                        onChange={e => setDescValue(e.target.value)}
                                        onKeyDown={e => {
                                          if (e.key === "Enter") handleSaveDesc(p.source, p.name);
                                          if (e.key === "Escape") setEditingDesc(null);
                                        }}
                                        autoFocus
                                        className="flex-1 px-1.5 py-0.5 text-xs border border-blue-300 rounded bg-white dark:bg-neutral-800 focus:outline-none"
                                      />
                                      <button onClick={() => handleSaveDesc(p.source, p.name)} className="text-green-500 hover:text-green-600">
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => setEditingDesc(null)} className="text-gray-400 hover:text-gray-500">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (() => {
                                    const desc = getDesc(p);
                                    return (
                                      <div
                                        className={`${lang !== "en" ? "cursor-pointer hover:text-blue-500" : ""}`}
                                        onClick={() => {
                                          if (lang !== "en") {
                                            setEditingDesc(memoKey);
                                            setDescValue(desc.localized || desc.original);
                                          }
                                        }}
                                        title={lang !== "en" ? `Click to edit ${lang.toUpperCase()} description` : undefined}
                                      >
                                        {desc.localized ? (
                                          <>
                                            <span className="text-gray-700 dark:text-gray-300 block truncate">{desc.localized}</span>
                                            {desc.original && (
                                              <span className="text-gray-400 dark:text-gray-500 text-[10px] block truncate">{desc.original}</span>
                                            )}
                                          </>
                                        ) : (
                                          <span className="text-gray-600 dark:text-gray-400 truncate block">
                                            {desc.original}
                                            {lang !== "en" && desc.original && (
                                              <span className="ml-1 text-gray-300 dark:text-gray-600 text-[10px]">(EN)</span>
                                            )}
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })()}
                                </td>
                                <td className="px-4 py-1.5">
                                  {isEditingThis ? (
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="text"
                                        value={memoValue}
                                        onChange={e => setMemoValue(e.target.value)}
                                        onKeyDown={e => {
                                          if (e.key === "Enter") handleSaveMemo(p.source, p.name);
                                          if (e.key === "Escape") setEditingMemo(null);
                                        }}
                                        autoFocus
                                        className="flex-1 px-1.5 py-0.5 text-xs border border-blue-300 rounded bg-white dark:bg-neutral-800 focus:outline-none"
                                      />
                                      <button onClick={() => handleSaveMemo(p.source, p.name)} className="text-green-500 hover:text-green-600">
                                        <Check className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => setEditingMemo(null)} className="text-gray-400 hover:text-gray-500">
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingMemo(memoKey);
                                        setMemoValue(p.memo || "");
                                      }}
                                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-full text-left"
                                    >
                                      {p.memo ? (
                                        <span className="text-gray-600 dark:text-gray-300 truncate">{p.memo}</span>
                                      ) : (
                                        <span className="flex items-center gap-0.5 italic">
                                          <Edit3 className="w-3 h-3" /> {t.memo}
                                        </span>
                                      )}
                                    </button>
                                  )}
                                </td>
                                <td className="px-2 py-1.5 text-center">
                                  <button
                                    onClick={() => openManual(p.source, p.name)}
                                    className="text-gray-400 hover:text-blue-500"
                                    title={t.manual}
                                  >
                                    <BookOpen className="w-3.5 h-3.5 mx-auto" />
                                  </button>
                                </td>
                                <td className="px-2 py-1.5">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleCheckSingle(p.source, p.name)}
                                      disabled={checkingSingle.has(`${p.source}::${p.name}`)}
                                      className="text-gray-400 hover:text-blue-500 disabled:opacity-50"
                                      title={t.checkUpdates}
                                    >
                                      <ArrowUpCircle className={`w-3.5 h-3.5 ${checkingSingle.has(`${p.source}::${p.name}`) ? "animate-spin" : ""}`} />
                                    </button>
                                    {p.update_available && (
                                      <button
                                        onClick={() => handleUpgradeSingle(p.source, p.name)}
                                        disabled={upgrading.has(`${p.source}::${p.name}`)}
                                        className="text-orange-500 hover:text-orange-600 disabled:opacity-50"
                                        title={`${t.update} → ${p.latest_version}`}
                                      >
                                        <RotateCw className={`w-3.5 h-3.5 ${upgrading.has(`${p.source}::${p.name}`) ? "animate-spin" : ""}`} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>&copy; chadchae</span>
          <span>{process.env.NEXT_PUBLIC_VERSION || "dev"}</span>
        </div>
      </footer>
    </div>
  );
}
