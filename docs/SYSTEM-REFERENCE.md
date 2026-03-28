# 🔧 SYSTEM-REFERENCE.md

> _最后更新：2026-03-27 23:00:01_

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
- AGENTS.md (279 行)
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
- logs/
- morning-meeting.sh/
- nightly-build/
- openzclaw-crontab/
- rollback.sh/
- self-optimize/

### 🌐 API 路由 / 连接配置

**OpenZeno 前端路由：**
- path="/"
- path="brain"
- path="briefings"
- path="cron"
- path="lab"
- path="lab/ideas"
- path="lab/prototypes"
- path="lab/research"
- path="meetings"
- path="memory"
- path="skills"

**Nginx 配置：**
    server_name oz.120619.xyz;
        proxy_pass http://127.0.0.1:8800;
    listen [::]:443 ssl ipv6only=on;
    listen 443 ssl;
    listen 80;
    listen [::]:80;
    server_name oz.120619.xyz;

### ⏰ 活跃定时任务



### 🔄 活跃进程

| 进程 | PID | 端口 | 状态 |
|------|-----|------|------|
| OpenZeno (Dev) | 535221 | 8800 | ✅ 运行中 |
| Nginx | 272055 | 80/443 | ✅ 运行中 |

### 🆕 近期文件（7天内）

| 文件 | 修改时间 |
|------|----------|
| skills/index.json | 2026-03-27 |
| skills/SKILL-TEMPLATE.md | 2026-03-27 |
| skills/README.md | 2026-03-27 |
| skills/MANAGEMENT.md | 2026-03-27 |
| scripts/openzclaw-crontab | 2026-03-27 |
| memory/2026-03-27.md | 2026-03-27 |
| docs/SYSTEM-REFERENCE.md | 2026-03-27 |
| docs/AI-ORG-CHART.md | 2026-03-27 |
| briefings/2026-03-27.md | 2026-03-27 |
| USER.md | 2026-03-27 |
| TOOLS.md | 2026-03-27 |
| SOUL.md | 2026-03-27 |
| MEMORY.md | 2026-03-27 |
| IDENTITY.md | 2026-03-27 |
| HEARTBEAT.md | 2026-03-27 |

### 📂 Git 变更（自 2026-03-27）

_无变更_

### 📝 今日动态

