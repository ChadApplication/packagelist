# PackageList

用于监控和管理 macOS 上已安装软件包的本地仪表板 — Homebrew formulae/casks、Python pip、uv tools。

## 前置要求

- Python 3.12+
- Node.js 18+
- Homebrew

## 安装

```bash
git clone https://github.com/ChadApplication/packagelist.git
cd packagelist
./setup.sh
```

## 使用方法

```bash
./run.sh start    # 启动服务器 (Backend :8020, Frontend :3020)
./run.sh stop     # 停止服务器
./run.sh restart  # 重启
./run.sh live     # 启动 + 实时日志流
```

打开 http://localhost:3020 并点击 **Scan**。

## 功能

- **软件包扫描**：并行扫描 Homebrew (formulae + casks)、pip、uv tools
- **分类过滤**：自动分类（AI/LLM、Development、Terminal、Media 等）
- **搜索**：按名称、描述（多语言）、备注实时搜索
- **排序**：名称升序/降序切换
- **备注**：每个软件包的注释，重新扫描后仍保留
- **多语言描述**：EN/KO/ZH — 点击描述编辑翻译
- **更新检查**：检测过期软件包，单个或批量更新
- **手册/文档**：一键打开每个软件包的主页
- **导出**：CSV 和 Markdown 下载
- **多语言界面**：EN / KO / ZH 界面切换

## 技术栈

- **Backend:** Python 3.12 / FastAPI
- **Frontend:** Next.js 15 / React 19 / TypeScript / Tailwind CSS
- **Storage:** JSON 文件（无数据库）

## API

| 方法 | 路径 | 说明 |
|--------|------|-------------|
| GET | /api/health | 健康检查 |
| POST | /api/packages/scan | 全量扫描 (brew + pip + uv) |
| GET | /api/packages | 软件包列表 (?category=, ?q=) |
| GET | /api/packages/categories | 分类计数 |
| PUT | /api/packages/{source}/{name}/memo | 更新备注 |
| PUT | /api/packages/{source}/{name}/description | 更新多语言描述 |
| POST | /api/packages/check-updates | 检查所有过期软件包 |
| POST | /api/packages/{source}/{name}/check-update | 检查单个软件包 |
| POST | /api/packages/{source}/{name}/upgrade | 升级单个软件包 |
| POST | /api/packages/upgrade-all | 升级所有过期软件包 |
| GET | /api/packages/{source}/{name}/manual | 获取文档 URL |
| GET | /api/packages/export | 导出 CSV 或 Markdown (?fmt=csv/md) |

## 变更日志

### v0.0.1 (2026-03-17)

- 初始发布
- 软件包扫描器（brew、pip、uv 并行扫描，含描述）
- 仪表板 UI（侧边栏过滤、可折叠分组、内联备注/描述编辑）
- 更新检查 + 单个/批量升级
- 手册/文档链接、CSV/MD 导出
- 多语言界面 (EN/KO/ZH) + 描述翻译
- 名称排序（升序/降序）
- 从 git 标签自动获取版本号的版权页脚

## 许可证

Copyright (c) chadchae
