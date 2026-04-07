# 系统参考文档

> 自动生成的系统文档。每晚23:00自动更新。  
> 上次更新: 2026-04-07 08:56:00

---

## 📝 今日变更（2026-04-07）

**今日变更 (5 个文件，+152/-55)**

### 🔄 日常运维
- `automations/backups/.last-backup` — 备份追踪文件更新
- `automations/logs/backup-20260407.log` — 私有仓库备份日志（+7行）
- `automations/logs/backup-cron.log` — 备份定时任务日志（+31行）
- `automations/logs/briefing-cron.log` — 每日简报定时任务日志（+4行）

### 📋 日常记录
- `memory/2026-04-07.md` — 今日工作记忆已记录（+163/-55）

> 📌 系统例行运行中，各项定时任务正常执行，无异常告警。

---

## 📝 今日变更（2026-04-06）

**今日提交 (10 个文件，+583/-278)**

### 🔌 后端重构：PostgreSQL → Supabase REST (PostgREST)
- `projects/OpenOrigin/api/index.js` — **重大重构**
  - 移除 `pg` Pool，直接改用 Supabase REST API（`sbGet/sbPost/sbPatch/sbDelete`）
  - 所有数据库操作改走 `GET/POST/PATCH/DELETE /rest/v1/{table}` 端点
  - 移除了 `INIT_SQL` 初始化逻辑（REST 模式下无需手动建表）
  - 新增 **Memory 模块**完整 CRUD：记忆提交 `/memory/`、记忆审批 `/memory/{id}/approve`
  - `handleMeetingStats` 改为并行 Promise.all 调用
  - `handleParliament` POST 拆解为多步插入后重新 fetch 完整对象
  - 所有错误处理增加 404 判断
- `projects/OpenOrigin/api/supabase.js`
  - Supabase API Key 已轮换（iat: 1775395668, exp: 2090971668）

### 🧠 前端新增：记忆注册模块
- `projects/OpenOrigin/src/App.jsx` — 新增「记忆」Tab 及 Brain 图标
  - 导入 `MemoryRegistry` 组件，路由到 `id: 'memory'`
- `projects/OpenOrigin/src/services/api.js` — 新增 3 个记忆 API 调用
  - `fetchMemories({ category, agentName, includePending })` — GET /memory
  - `submitMemory({ agentName, category, content })` — POST /memory/
  - `approveMemory(memoryId, approved)` — PATCH /memory/{id}/approve

### 📋 日常记录
- `memory/2026-04-06.md` — 今日工作记忆已记录
- `automations/logs/backup-*.log` — 备份日志正常更新

---

## 🏗 架构概览

**项目:** OpenOrigin - AI Agent Command Center  
**技术栈:** React + Vite + Tailwind CSS + Framer Motion + Lucide Icons + Recharts  
**工作空间:** /Users/liam/.openclaw/workspace

### 目录结构

```
automations/  (0 文件)
docs/         (2 文件)
memory/       (11 文件)
projects/     (12222 文件)
scripts/      (0 文件)
```

---

## 📦 模块清单

| 模块 | 路径 | 说明 |
|------|------|------|
| Dashboard | src/modules/Dashboard/ | 指挥甲板 - 系统概览 |
| Agents | src/modules/Agents/ | 特工档案 - Agent管理 |
| TaskBoard | src/modules/TaskBoard/ | 任务看板 - 看板式任务管理 |
| Logs | src/modules/Logs/ | AI日志 - 实时日志查看 |
| Parliament | src/modules/Parliament/ | 多Agent讨论界面 |
| Meetings | src/modules/Meetings/ | 会议情报 - 会议记录与分析 |
| Ops | src/modules/Ops/ | 任务管理 - 任务创建/筛选 |
| Brain | src/modules/Brain/ | 每日简报生成 + **记忆注册（新增）** |
| Lab | src/modules/Lab/ | 实验仪表盘 |

---

## ⏰ 活跃定时任务

| 任务 | 脚本 | 定时规则 | 说明 |
|------|------|----------|------|
| 每日简报 | automations/scripts/daily-briefing.sh | 30 8 * * * | 生成每日摘要 |
| 夜间优化 | automations/scripts/self-optimize.sh | 0 2 * * * | 审计+低风险修复 |
| 文档更新 | automations/scripts/update-docs.sh | 0 23 * * * | 滚动更新系统文档 |
| 仓库备份 | automations/scripts/backup-repo.sh | 0 */6 * * * | 每6小时备份 |

### 最近执行状态

- **2026-04-03 21:36** backup-repo.sh ✅ 成功
- **2026-04-03 21:38** self-optimize.sh ✅ 得分 92/100
- **2026-04-03 21:39** daily-briefing.sh ✅ 成功
- **2026-04-03 21:40** update-docs.sh ✅ 成功

---

## 🔧 自动化脚本

| 脚本 | 功能 |
|------|------|
| backup-repo.sh | 私有仓库备份 |
| self-optimize.sh | 夜间自我优化 |
| daily-briefing.sh | 每日简报生成 |
| update-docs.sh | 滚动式文档更新 |

---

## ⚠️ 已知问题 / 待解决

### Telegram Delivery 持续性故障（自 2026-04-05 起）
- **问题：** 3 个 Cron 任务（Telegram投递）报 error，`recipient @heartbeat could not be resolved to a numeric chat ID (400: Bad Request: chat not found)`
- **影响任务：** 滚动式OS文档、私有仓库备份、夜间自我改进
- **状态：** 🟡 中 — 待修复 Telegram bot token / chat ID 配置

### 自优化得分尚有提升空间
- **当前：** 92/100（低风险）
- **建议：** 定期处理 TODO、逾期待办

### Cron 任务补跑建议
- [ ] 昨夜失败的 3 个任务（backup-repo / update-docs / self-optimize）可补跑

---

## 📁 关键文件索引

| 文件 | 说明 |
|------|------|
| `projects/OpenOrigin/api/index.js` | API 主入口（已重构为 Supabase REST） |
| `projects/OpenOrigin/api/supabase.js` | Supabase 连接配置 |
| `projects/OpenOrigin/src/services/api.js` | 前端 API 客户端（含 Memory 模块） |
| `projects/OpenOrigin/src/App.jsx` | React 根组件（含新增 Memory Tab） |
| `automations/scripts/*.sh` | 定时任务脚本 |
| `docs/SYSTEM-REFERENCE.md` | 本文档 |

---

## 🔄 回滚指南

### 1. Git 回滚
```bash
# 查看变更
git log --oneline -10

# 撤销特定提交
git revert <commit-hash>

# 强制回退到某个版本
git reset --hard <commit-hash>
git push --force
```

### 2. 文件恢复
```bash
# 恢复特定文件
git checkout <commit-hash> -- path/to/file

# 从备份恢复 docs/SYSTEM-REFERENCE.md
cp docs/SYSTEM-REFERENCE.md docs/SYSTEM-REFERENCE.md.bak
```

### 3. 文档恢复
```bash
# 查看文档历史
git log --follow docs/SYSTEM-REFERENCE.md

# 恢复文档到上一个版本
git show HEAD~1:docs/SYSTEM-REFERENCE.md > docs/SYSTEM-REFERENCE.md
```

---

*此文档由 update-docs.sh 自动生成。请勿手动编辑，会被覆盖。*
