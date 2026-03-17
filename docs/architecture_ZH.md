# 架构

PackageList 是一个用于监控和管理 macOS 包的本地仪表盘。使用 FastAPI 后端和 Next.js 前端，通过 REST API 通信。没有认证和数据库 -- 数据以单个 JSON 文件持久化。

## 后端

**技术栈：** Python 3.12 / FastAPI / Uvicorn

### 入口点 (`backend/main.py`)

FastAPI 应用在 `/api/` 下暴露 12 个 REST 端点。初始化一个 `PackageScanner` 和一个 `PackageStore`，供所有端点使用。CORS 完全开放（`allow_origins=["*"]`）以支持本地开发。

### 扫描器 (`backend/services/scanner.py`)

`PackageScanner` 使用 `asyncio.gather` 并行扫描四个包来源：

- **Homebrew formulae**（`_scan_brew_formulae`）：运行 `brew leaves` 获取顶层 formulae，然后对每个运行 `brew info` 提取版本、描述和主页。通过 `_categorize_brew` 中的关键词匹配自动分配类别（AI/LLM、Development、Search/Text、Terminal/System、Media/Image、Document/Presentation、Utility）。
- **Homebrew casks**（`_scan_brew_casks`）：运行 `brew list --cask`，然后对每个运行 `brew info --cask`。所有 cask 均归类为"GUI App"。
- **pip**（`_scan_pip`）：运行 `pip list --format=json`，然后通过 `pip show` 批量获取描述和主页（每批 30 个包）。归类为"Python (pip)"。
- **uv tools**（`_scan_uv_tools`）：运行 `uv tool list`，从输出行解析名称/版本，然后尝试使用 `pip show` 获取描述。归类为"Python (uv tool)"。

所有子进程调用在 `asyncio.to_thread` 中运行以避免阻塞事件循环，支持可配置超时。

更新检查也是并行的：`check_outdated` 同时运行 `brew outdated --json=v2` 和 `pip list --outdated --format=json`。

### 存储 (`backend/services/store.py`)

`PackageStore` 处理 `backend/data/packages.json` 的 JSON 文件持久化。

关键行为 -- **备注和描述保留**：保存时，存储会加载现有文件，构建以 `(source, name)` 为键的保留字段映射（`memo`、`description_ko`、`description_zh`），并将它们合并到新的包列表中。这确保用户输入的备注和翻译描述在重新扫描后得以保留。

## 前端

**技术栈：** Next.js 15 / React 19 / TypeScript / Tailwind CSS

### 单页应用 (`frontend/src/app/page.tsx`)

整个 UI 是一个客户端 React 组件（`"use client"`）。通过 Next.js rewrites 代理与后端通信（配置为将 `/api/*` 转发到后端端口）。

### 布局

- **头部**：标题、包/更新计数、语言选择器（EN/KO/ZH）、扫描按钮、检查更新按钮、全部更新按钮、全部展开/折叠切换、CSV/MD 导出链接。
- **侧边栏**：搜索输入框（实时筛选，匹配名称、描述、备注）和带计数的类别筛选按钮。
- **主内容区**：包按 `source::category` 分组，以可折叠手风琴区段显示。每个区段展开后为一个表格，列包括：名称、版本、描述、备注、文档、操作。
- **底部**：版权信息和版本号（来自 `NEXT_PUBLIC_VERSION` 环境变量或 git 标签）。

### 国际化系统

国际化通过内联 `i18n` 对象实现，将语言代码（`en`、`ko`、`zh`）映射到字符串键。当前语言存储在 React 状态中。类别名称也通过 `cat:` 前缀键进行翻译。

对于包描述，双显示模式展示翻译后的描述（KO/ZH），原始英文描述以较小字体显示在下方。在非英语语言激活时点击描述会打开内联编辑器进行翻译。仅支持 `ko` 和 `zh` 翻译（存储为每个包的 `description_ko` 和 `description_zh`）。

### 类别自动分类

类别由扫描器在服务端分配。Brew formulae 通过包名称和描述的关键词匹配进行分类。Brew cask 默认为"GUI App"。Pip 和 uv-tool 包各有固定类别。
