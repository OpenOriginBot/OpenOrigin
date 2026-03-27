# 🔧 SYSTEM-REFERENCE.md

> _最后更新：2026-03-27 06:32:30_

---

### 🏗️ 当前架构

```
OpenClaw Workspace
├── agents/          # AI Agent 配置
├── docs/            # 系统文档
├── memory/          # 每日记忆
├── projects/        # 项目目录
│   └── openzeno/    # OpenZeno 仪表板
├── skills/          # 技能模块
├── scripts/         # 自动化脚本
│   └── cron/        # 定时任务
├── SOUL.md          # 身份宪章
├── USER.md          # 用户档案
├── AGENTS.md        # 运营手册
├── TOOLS.md         # 工具配置
└── MEMORY.md        # 长期记忆
```

### 📦 模块清单

**核心配置：**
- AGENTS.md (135 行)
- HEARTBEAT.md (7 行)
- IDENTITY.md (7 行)
- MEMORY.md (145 行)
- SOUL.md (60 行)
- TOOLS.md (106 行)
- USER.md (68 行)

**项目：**
- openzeno (Node.js)

**自动化脚本：**
- README.md/
- backup/
- briefing/
- docs/
- install.sh/
- openzclaw-crontab/
- rollback.sh/
- self-optimize/

### 🌐 API 路由 / 连接配置

**OpenZeno 前端路由：**
- path="/"
- path="brain"
- path="lab"

**Nginx 配置：**
    server_name oz.120619.xyz;
        proxy_pass http://127.0.0.1:8800;
    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    listen 80;
    listen [::]:80;
    server_name oz.120619.xyz;

### ⏰ 活跃定时任务



### 🔄 活跃进程

| 进程 | PID | 端口 | 状态 |
|------|-----|------|------|
| OpenZeno (Dev) | 274127 | 8800 | ✅ 运行中 |
| Nginx | 272055 | 80/443 | ✅ 运行中 |

### 🆕 近期文件（7天内）

| 文件 | 修改时间 |
|------|----------|
| memory/2026-03-27.md | 2026-03-27 |
| docs/SYSTEM-REFERENCE.md | 2026-03-27 |
| USER.md | 2026-03-27 |
| TOOLS.md | 2026-03-27 |
| SOUL.md | 2026-03-27 |
| MEMORY.md | 2026-03-27 |
| IDENTITY.md | 2026-03-27 |
| HEARTBEAT.md | 2026-03-27 |
| AGENTS.md | 2026-03-27 |
| .openclaw/workspace-state.json | 2026-03-27 |

### 📂 Git 变更（自 2026-03-27）

_无变更_

### 📝 今日动态

## 今日任务

- [待填充]

## 异常事件

- [待填充]

## 明日待办

- [待填充]

### ⚠️ 已知问题

- [2026-03-27.md] ## 异常事件
_无已知问题_

---
_由 OpenClaw 自动化维护_
