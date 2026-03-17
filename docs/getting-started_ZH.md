# 快速入门

## 前置条件

- **Python 3.12+**（通过 pyenv 或 Homebrew 安装）
- **Node.js 18+**（通过 Homebrew 安装：`brew install node`）
- **Homebrew**（brew 包扫描所必需）

## 安装

1. 克隆代码仓库：

```bash
git clone https://github.com/ChadApplication/packagelist.git
cd packagelist
```

2. 运行设置脚本：

```bash
./setup.sh
```

该脚本将：
- 验证 Python、Node.js 和 Homebrew 已安装
- 在 `backend/venv/` 中创建 Python 虚拟环境
- 从 `backend/requirements.txt` 安装后端依赖
- 安装前端 npm 包
- 创建 `frontend/.env.local` 并配置默认后端端口

## 运行

启动两个服务：

```bash
./run.sh start
```

后端（FastAPI）默认运行在端口 8020，前端（Next.js）默认运行在端口 3020。如果这些端口被占用，脚本会使用 `lsof` 自动查找下一个可用端口。

其他命令：

```bash
./run.sh stop      # 停止所有服务
./run.sh restart   # 先停止再启动
./run.sh status    # 显示运行状态
./run.sh live      # 启动 + 实时日志流
```

## 首次使用

1. 在浏览器中打开 http://localhost:3020。
2. 点击 **Scan** 扫描所有已安装的包。
3. 使用侧边栏按类别筛选，或使用搜索栏按名称、描述或备注查找包。
