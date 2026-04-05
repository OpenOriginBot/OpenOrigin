# 系统参考文档

> 自动生成的系统文档。每晚23:00自动更新。  
> 上次更新: 2026-04-05 23:00:06

---

## 📝 今日变更 (2026-04-05)

- **18:00** 自动备份触发，`2ccce3a` → 成功推送至 auto-backup/liams-Mac-mini.local
- **12:00** 自动备份触发，`68d9bbb` +2 新增文件
- **06:00** 自动备份触发，`320297e`
- **00:00** 自动备份触发，`03dee22` +2 新增文件

**今日修改文件（共4个）：**
  - `MEMORY.md` — 长期记忆更新
  - `automations/backups/.last-backup` — 备份时间戳更新
  - `automations/logs/backup-20260405.log` — 备份日志追加
  - `automations/logs/backup-cron.log` — Cron触发记录

**今日提交（5个）：**
  - `03dee22` 00:00 自动备份 | +2新增
  - `c624621` chore: 备份日志与定时任务状态更新
  - `320297e` 06:00 自动备份
  - `68d9bbb` 12:00 自动备份 | +2新增
  - `2ccce3a` 18:00 自动备份

---

## 🏗 架构概览

**项目:** OpenOrigin - AI Agent Command Center  
**技术栈:** React + Vite + Tailwind CSS + Framer Motion + Lucide Icons + Recharts  
**工作空间:** /Users/liam/.openclaw/workspace

### 目录结构

[23:00:06] [分析] 项目结构...


**目录结构:**
  - automations/ (0 文件)
  - docs/ (2 文件)
  - memory/ (9 文件)
  - projects/ (12118 文件)
  - scripts/ (0 文件)

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
| Brain | src/modules/Brain/ | 每日简报生成 |
| Lab | src/modules/Lab/ | 实验仪表盘 |

---

## ⏰ 活跃定时任务

[23:00:06] [分析] 定时任务...


**HEARTBEAT 任务:**
  # HEARTBEAT.md
  
  ## 活跃定时任务
  
  | 任务 | 脚本 | 定时规则 | 说明 |
  |------|------|----------|------|
  | 每日简报 | automations/scripts/daily-briefing.sh | 30 8 * * * | 生成每日摘要 |
  | 夜间优化 | automations/scripts/self-optimize.sh | 0 2 * * * | 审计+低风险修复 |
  | 文档更新 | automations/scripts/update-docs.sh | 0 23 * * * | 滚动更新系统文档 |
  | 仓库备份 | automations/scripts/backup-repo.sh | 0 */6 * * * | 每6小时备份 |
  
  ## 最近执行状态
  
  - **2026-04-03 21:36** backup-repo.sh ✅ 成功
  - **2026-04-03 21:38** self-optimize.sh ✅ 得分 92/100
  - **2026-04-03 21:39** daily-briefing.sh ✅ 成功
  - **2026-04-03 21:40** update-docs.sh ✅ 成功
  
  ## 文档
  
  配置说明：`docs/AUTOMATIONS.md`
  - backup-repo: 
  - daily-briefing: 
  - self-optimize: 
  - update-docs: 

---

## 🔧 自动化脚本

| 脚本 | 功能 |
|------|------|
| backup-repo.sh | 私有仓库备份 |
| self-optimize.sh | 夜间自我优化 |
| daily-briefing.sh | 每日简报生成 |
| update-docs.sh | 滚动式文档更新 |

---

## 🐛 已知问题

[23:00:06] [分析] 已知问题...


---
2026-03-28.md:
  - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
  - 建议尽快查看这些任务的最近执行日志，定位失败原因

---
2026-03-31.md:
  - 无（本次未发现任何问题）

---
2026-04-04.md:
  3. **自优化得分尚有提升空间**：当前 92/100，发现的问题（TODO、逾期待办）属于低风险，但建议定期处理。

---
2026-04-05.md:
  - [ ] 修复 3 个 Cron error 状态任务（Telegram 投递失败，recipient @heartbeat 无法解析）
  **⚠️ 昨夜警报：** 4 个 Cron 任务中仅 1 个（每日简报）实际执行，但因 Telegram 投递失败而报 error。备份、文档更新、夜间优化均未执行成功。
  | 🔴 高 | 修复 Telegram delivery 配置 | 3 个任务的 failureAlert.to = "telegram:6810379425"，但 recipient @heartbeat 解析失败 |
  | 🟡 中 | 补跑昨夜失败的 3 个任务 | 滚动式OS文档、私有仓库备份、夜间自我改进 |
  1. **Cron 任务 Telegram 投递失败**（持续性问题）：

---
briefing-2026-04-03.md:
    - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）

---
briefing-2026-04-04.md:
    - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
      - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）

---
briefing-2026-04-05.md:
    - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
      - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
      - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
        - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）

---

## 📊 系统状态

- 今日提交: 5
- 备份状态: success
- 最后备份: 2026-04-05 18:00:04

---

## 🔄 回滚指南

如需撤销自动化产生的错误修改：

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
