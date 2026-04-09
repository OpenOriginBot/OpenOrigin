# 🔧 SYSTEM-REFERENCE.md

> _最后更新：2026-04-08 23:00:01_

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
| memory/2026-04-08.md | 2026-04-08 |
| docs/SYSTEM-REFERENCE.md | 2026-04-08 |
| briefings/2026-04-08.md | 2026-04-08 |
| memory/2026-04-07.md | 2026-04-07 |
| briefings/2026-04-07.md | 2026-04-07 |
| memory/2026-04-06.md | 2026-04-06 |
| briefings/2026-04-06.md | 2026-04-06 |
| memory/2026-04-05.md | 2026-04-05 |
| briefings/2026-04-05.md | 2026-04-05 |
| memory/2026-04-04.md | 2026-04-04 |
| briefings/2026-04-04.md | 2026-04-04 |
| memory/2026-04-03.md | 2026-04-03 |
| briefings/2026-04-03.md | 2026-04-03 |
| memory/2026-04-02.md | 2026-04-02 |
| briefings/2026-04-02.md | 2026-04-02 |

### 📂 Git 变更（自 2026-03-27）

5c96a64 📝 [2026-04-08 18:00] 工作区更新
M	scripts/cron/logs/backup-20260408.log
d904f37 📝 [2026-04-08 12:00] 未跟踪 3 个文件
A	briefings/2026-04-08.md
A	memory/2026-04-08.md
M	scripts/cron/logs/backup-20260408.log
M	scripts/cron/logs/collect-ideas-20260408.log
A	"team/meetings/2026-04-08-\346\257\217\346\227\245\345\220\214\346\255\245\344\274\232\350\256\256.md"
b2ee2fe 📝 [2026-04-08 06:00] 未跟踪 1 个文件
M	scripts/cron/logs/backup-20260408.log
A	scripts/cron/logs/collect-ideas-20260408.log
d01bc54 📝 [2026-04-08 00:00] 未跟踪 1 个文件
M	docs/SYSTEM-REFERENCE.md
M	scripts/cron/logs/backup-20260407.log
A	scripts/cron/logs/backup-20260408.log
5985a67 📝 [2026-04-07 18:00] 工作区更新
M	scripts/cron/logs/backup-20260407.log
c7956c0 📝 [2026-04-07 12:00] 未跟踪 3 个文件
A	briefings/2026-04-07.md
A	memory/2026-04-07.md
M	scripts/cron/logs/backup-20260407.log
M	scripts/cron/logs/collect-ideas-20260407.log
A	"team/meetings/2026-04-07-\346\257\217\346\227\245\345\220\214\346\255\245\344\274\232\350\256\256.md"
b768bc8 📝 [2026-04-07 06:00] 未跟踪 1 个文件
M	scripts/cron/logs/backup-20260407.log
A	scripts/cron/logs/collect-ideas-20260407.log
f102179 📝 [2026-04-07 00:00] 未跟踪 1 个文件
M	docs/SYSTEM-REFERENCE.md
M	scripts/cron/logs/backup-20260406.log
A	scripts/cron/logs/backup-20260407.log
f4868d2 📝 [2026-04-06 18:00] 工作区更新
M	scripts/cron/logs/backup-20260406.log
b52e35c 📝 [2026-04-06 12:00] 未跟踪 3 个文件
A	briefings/2026-04-06.md
A	memory/2026-04-06.md
M	scripts/cron/logs/backup-20260406.log
M	scripts/cron/logs/collect-ideas-20260406.log
A	"team/meetings/2026-04-06-\346\257\217\346\227\245\345\220\214\346\255\245\344\274\232\350\256\256.md"
0683d29 📝 [2026-04-06 06:00] 未跟踪 1 个文件
M	scripts/cron/logs/backup-20260406.log
A	scripts/cron/logs/collect-ideas-20260406.log
c93a88e 📝 [2026-04-06 00:00] 未跟踪 1 个文件
M	docs/SYSTEM-REFERENCE.md
M	scripts/cron/logs/backup-20260405.log
A	scripts/cron/logs/backup-20260406.log
00a66da 📝 [2026-04-05 18:00] 工作区更新
M	scripts/cron/logs/backup-20260405.log
5e6664a 📝 [2026-04-05 12:00] 未跟踪 2 个文件
A	briefings/2026-04-05.md
A	memory/2026-04-05.md

### 📝 今日动态

