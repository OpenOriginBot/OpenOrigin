# 🔧 SYSTEM-REFERENCE.md

> _最后更新：2026-03-31 23:00:01_

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
- TOOLS.md (119 行)
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
| memory/2026-03-31.md | 2026-03-31 |
| docs/SYSTEM-REFERENCE.md | 2026-03-31 |
| briefings/2026-03-31.md | 2026-03-31 |
| memory/2026-03-30.md | 2026-03-30 |
| briefings/2026-03-30.md | 2026-03-30 |
| memory/2026-03-29.md | 2026-03-29 |
| briefings/2026-03-29.md | 2026-03-29 |
| team/SUBAGENT-MONITORING.md | 2026-03-28 |
| team/DELEGATION-RULES.md | 2026-03-28 |
| team/CROSS-DEPARTMENT-HANDOVER.md | 2026-03-28 |
| team/AUTONOMY-PERMISSIONS.md | 2026-03-28 |
| skills/index.json | 2026-03-28 |
| memory/2026-03-28.md | 2026-03-28 |
| briefings/2026-03-28.md | 2026-03-28 |
| TOOLS.md | 2026-03-28 |

### 📂 Git 变更（自 2026-03-27）

62f1eaf 📝 [2026-03-31 18:00] 工作区更新
M	scripts/cron/logs/backup-20260331.log
d8ee191 📝 [2026-03-31 12:00] 未跟踪 3 个文件
A	briefings/2026-03-31.md
A	memory/2026-03-31.md
M	scripts/cron/logs/backup-20260331.log
A	"team/meetings/2026-03-31-\346\257\217\346\227\245\345\220\214\346\255\245\344\274\232\350\256\256.md"
5cc0f08 📝 [2026-03-31 06:00] 未跟踪 1 个文件
M	scripts/cron/logs/backup-20260331.log
A	scripts/cron/logs/collect-ideas-20260331.log
c8cda34 📝 [2026-03-31 00:00] 未跟踪 1 个文件
M	docs/SYSTEM-REFERENCE.md
M	scripts/cron/logs/backup-20260330.log
A	scripts/cron/logs/backup-20260331.log
d51d7a0 📝 [2026-03-30 18:00] 工作区更新
M	scripts/cron/logs/backup-20260330.log
f8a5d46 📝 [2026-03-30 12:00] 未跟踪 3 个文件
A	briefings/2026-03-30.md
A	memory/2026-03-30.md
M	scripts/cron/logs/backup-20260330.log
A	"team/meetings/2026-03-30-\346\257\217\346\227\245\345\220\214\346\255\245\344\274\232\350\256\256.md"
9bf63a4 📝 [2026-03-30 06:00] 未跟踪 1 个文件
M	scripts/cron/logs/backup-20260330.log
A	scripts/cron/logs/collect-ideas-20260330.log
8a96ece 📝 [2026-03-30 00:00] 未跟踪 1 个文件
M	docs/SYSTEM-REFERENCE.md
M	scripts/cron/logs/backup-20260329.log
A	scripts/cron/logs/backup-20260330.log
cc5d174 📝 [2026-03-29 18:00] 工作区更新
M	scripts/cron/logs/backup-20260329.log
71de5fc 📝 [2026-03-29 12:00] 未跟踪 2 个文件
A	briefings/2026-03-29.md
A	memory/2026-03-29.md
M	projects/openzeno/src/data/ideas.json
M	scripts/cron/logs/backup-20260329.log
M	scripts/cron/logs/collect-ideas-20260329.log
6f697fc 📝 [2026-03-29 06:00] 未跟踪 1 个文件
M	scripts/cron/logs/backup-20260329.log
A	scripts/cron/logs/collect-ideas-20260329.log
319ac2b 📝 [2026-03-29 00:00] 未跟踪 1 个文件
M	docs/SYSTEM-REFERENCE.md
M	scripts/cron/logs/backup-20260328.log
A	scripts/cron/logs/backup-20260329.log
ba6d51e 📝 [2026-03-28 18:00] 未跟踪 6 个文件
M	memory/2026-03-28.md
M	scripts/cron/logs/backup-20260328.log
M	scripts/cron/openzclaw-crontab
A	skills/backup/SKILL.md
A	skills/collect-ideas/SKILL.md
A	skills/daily-briefing/SKILL.md

### 📝 今日动态

