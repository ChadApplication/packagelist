# API 参考

所有端点以 `/api` 为前缀。后端默认运行在端口 8020。

## 端点

### 1. 健康检查

- **方法：** `GET`
- **路径：** `/api/health`
- **描述：** 返回服务器健康状态。
- **响应：** `{"status": "ok"}`

### 2. 扫描包

- **方法：** `POST`
- **路径：** `/api/packages/scan`
- **描述：** 对所有包来源（Homebrew formulae、Homebrew casks、pip、uv tools）执行全量并行扫描。结果保存到 JSON 存储中。
- **响应：** `{"status": "ok", "count": <number>}`

### 3. 列出包

- **方法：** `GET`
- **路径：** `/api/packages`
- **描述：** 返回存储的包列表，支持可选筛选。
- **查询参数：**
  - `category`（可选）：按类别名称筛选（精确匹配）。
  - `q`（可选）：搜索字符串，匹配名称、描述和备注（不区分大小写）。
- **响应：** `{"packages": [...]}`

### 4. 获取类别

- **方法：** `GET`
- **路径：** `/api/packages/categories`
- **描述：** 返回不重复的类别名称及包数量。
- **响应：** `{"categories": {"AI / LLM": 5, "Development": 12, ...}}`

### 5. 更新备注

- **方法：** `PUT`
- **路径：** `/api/packages/{source}/{name}/memo`
- **描述：** 更新特定包的用户备注。
- **路径参数：**
  - `source`：包来源（例如 `brew-formula`、`brew-cask`、`pip`、`uv-tool`）。
  - `name`：包名称。
- **请求体：** `{"memo": "<text>"}`
- **响应：** `{"status": "ok"}` 或 `{"status": "error", "message": "Package not found"}`

### 6. 更新本地化描述

- **方法：** `PUT`
- **路径：** `/api/packages/{source}/{name}/description`
- **描述：** 更新包的本地化（翻译）描述。仅接受 `ko` 和 `zh` 语言。
- **路径参数：**
  - `source`：包来源。
  - `name`：包名称。
- **请求体：** `{"lang": "ko" | "zh", "text": "<translated description>"}`
- **响应：** `{"status": "ok"}` 或 `{"status": "error", "message": "..."}`

### 7. 检查所有更新

- **方法：** `POST`
- **路径：** `/api/packages/check-updates`
- **描述：** 检查所有来源（brew formulae、brew casks、pip）中的过时包。更新存储中的 `update_available` 和 `latest_version` 字段。
- **响应：** `{"status": "ok", "outdated_count": <number>}`

### 8. 检查单个包更新

- **方法：** `POST`
- **路径：** `/api/packages/{source}/{name}/check-update`
- **描述：** 检查单个包是否有可用更新。支持 `brew-formula`、`brew-cask` 和 `pip` 来源。
- **路径参数：**
  - `source`：包来源。
  - `name`：包名称。
- **响应：** `{"status": "ok", "update_available": true|false, "latest": "<version>"}`

### 9. 升级单个包

- **方法：** `POST`
- **路径：** `/api/packages/{source}/{name}/upgrade`
- **描述：** 使用相应的包管理器升级单个包（`brew upgrade`、`brew upgrade --cask` 或 `pip install --upgrade`）。完成后清除更新标志。
- **路径参数：**
  - `source`：包来源。
  - `name`：包名称。
- **响应：** `{"status": "ok", "output": "<first 500 chars of command output>"}`

### 10. 升级所有过时包

- **方法：** `POST`
- **路径：** `/api/packages/upgrade-all`
- **描述：** 升级所有过时包。对所有 brew 包运行 `brew upgrade`，对过时 pip 包运行 `pip install --upgrade`。清除所有更新标志。
- **响应：** `{"status": "ok", "upgraded": <number>}`

### 11. 获取手册/文档 URL

- **方法：** `GET`
- **路径：** `/api/packages/{source}/{name}/manual`
- **描述：** 返回包的文档 URL。如果包有主页，返回主页及派生 URL（GitHub 的 README、wiki；pypi.org 的 PyPI 链接）。没有主页时回退到 Google 搜索 URL。
- **路径参数：**
  - `source`：包来源。
  - `name`：包名称。
- **响应：** `{"status": "ok", "urls": {"homepage": "...", "readme": "...", ...}}`

### 12. 导出包

- **方法：** `GET`
- **路径：** `/api/packages/export`
- **描述：** 将完整包列表导出为可下载文件。包按来源、类别、名称排序。
- **查询参数：**
  - `fmt`（可选，默认 `csv`）：导出格式。可选值：`csv` 或 `md`。
- **响应：** 文件下载（`text/csv` 或 `text/markdown`）。
  - CSV 列：Source、Category、Name、Version、Description、Homepage、Memo、Update Available、Latest Version。
  - Markdown：包含相同列的表格。
