# 系统参考文档

> 自动生成的系统文档。每晚23:00自动更新。  
> 上次更新: 2026-04-09 15:00:00

---

## 📝 今日变更 (2026-04-09)

[15:00:00] 滚动式文档更新执行

**今日提交 (5 个):**
  bbfb9e8 📦 2026-04-09 18:00 自动备份
  004dda7 📦 2026-04-09 12:00 自动备份 | +       2新增
  69cc5f1 📦 2026-04-09 06:00 自动备份
  1732dac chore: 同步日常记忆与自动化日志 (2026-04-09)
  135fe4f 📦 2026-04-09 00:00 自动备份 | +       2新增

**修改文件 (5 个):**
  - automations/backups/.last-backup
  - automations/logs/backup-20260409.log
  - automations/logs/backup-cron.log
  - automations/logs/docs-cron.log
  - docs/SYSTEM-REFERENCE.md (+47 -20)

---

## 📝 今日变更 (2026-04-09)

[23:00:02] [0;34m[分析] 今日变更...[0m


**今日提交 (5 个):**
  bbfb9e8 📦 2026-04-09 18:00 自动备份
  004dda7 📦 2026-04-09 12:00 自动备份 | +       2新增
  69cc5f1 📦 2026-04-09 06:00 自动备份
  1732dac chore: 同步日常记忆与自动化日志 (2026-04-09)
  135fe4f 📦 2026-04-09 00:00 自动备份 | +       2新增

**修改文件:**
  - automations/backups/.last-backup
  - automations/logs/backup-20260409.log
  - automations/logs/backup-cron.log
  - automations/logs/docs-cron.log

---

## 🏗 架构概览

**项目:** OpenOrigin - AI Agent Command Center  
**技术栈:** React + Vite + Tailwind CSS + Framer Motion + Lucide Icons + Recharts  
**工作空间:** /Users/liam/.openclaw/workspace

### 目录结构

[23:00:03] [0;34m[分析] 项目结构...[0m


**目录结构:**
  - automations/ (0 文件)
  - data/ (3 文件)
  - docs/ (2 文件)
  - memory/ (17 文件)
  - projects/ (12220 文件)
  - scripts/ (1 文件)

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

[23:00:02] [0;34m[分析] 定时任务...[0m


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
  
  - **2026-04-09 08:30** daily-briefing.sh ✅ 成功（2026-04-09 早上简报已生成）
  - **2026-04-09 02:11** backup-repo.sh ✅ 成功（无变更，跳过推送）
  - **2026-04-09 02:08** 夜间自我改进 ✅ 手动触发成功，delivered=true
  - **2026-04-09 02:06** 私有仓库备份 ✅ 手动触发成功，delivered=true
  - **2026-04-08 23:00** update-docs.sh ⚠️ error（修复前最后一次旧执行，修复后下次应正常）
  
  > ✅ Telegram 投递修复已完成（delivery.to 和 failureAlert.to 均设为 telegram:6810379425）
  > ✅ 私有仓库备份和夜间自我改进均已验证成功
  > 📝 HEARTBEAT.md 更新于 2026-04-09 02:13
  
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

[23:00:02] [0;34m[分析] 已知问题...[0m


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
2026-04-06.md:
  - [ ] 确认昨夜失败的 3 个任务（backup-repo / update-docs / self-optimize）是否需要补跑
  | 🟡 中 | 补跑昨夜失败的 3 个任务 | update-docs / backup-repo / self-optimize |
  1. **Telegram delivery 配置错误（持续未解决）**：
     - 错误信息：`Telegram recipient @heartbeat could not be resolved to a numeric chat ID (400: Bad Request: chat not found)`
  3. **Telegram channel 可能配置异常**：需检查 OpenClaw Gateway 的 Telegram 集成配置，确认 bot token 和 chat ID 是否匹配

---
2026-04-07.md:
  - [ ] 排查昨夜 23:00 时段 Cron 批量失败的原因（Telegram 投递失败？脚本执行异常？）
  3 个 Cron 任务在昨夜 23:00 同时进入 error 状态，可能存在共同诱因（如 Telegram 连接失败、投递超时、脚本依赖异常等），建议优先排查。
  - **Cron 任务批量异常**：昨夜 23:00 同时有 3 个任务进入 error 状态，需优先处理
  - 导致部署一直失败
  **问题根因：** `failureAlert.to` 配置成了 `telegram:@heartbeat`，系统试图发消息给 Telegram 用户 `@heartbeat`，但该用户名不存在（从未与机器人有过交互），导致 `chat not found` 错误。

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
briefing-2026-04-06.md:
    - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
    - [ ] 修复 3 个 Cron error 状态任务（Telegram 投递失败，recipient @heartbeat 无法解析）
      - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
      - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
        - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）

---
briefing-2026-04-07.md:
    - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
    - [ ] 修复 3 个 Cron error 状态任务（Telegram 投递失败，recipient @heartbeat 无法解析）
    - [ ] 确认昨夜失败的 3 个任务（backup-repo / update-docs / self-optimize）是否需要补跑
      - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
      - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）

---
briefing-2026-04-08.md:
    - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
    - [ ] 修复 3 个 Cron error 状态任务（Telegram 投递失败，recipient @heartbeat 无法解析）
    - [ ] 确认昨夜失败的 3 个任务（backup-repo / update-docs / self-optimize）是否需要补跑
    - [ ] 排查昨夜 23:00 时段 Cron 批量失败的原因（Telegram 投递失败？脚本执行异常？）
      - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）

---
briefing-2026-04-09.md:
    - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）
    - [ ] 修复 3 个 Cron error 状态任务（Telegram 投递失败，recipient @heartbeat 无法解析）
    - [ ] 确认昨夜失败的 3 个任务（backup-repo / update-docs / self-optimize）是否需要补跑
    - [ ] 排查昨夜 23:00 时段 Cron 批量失败的原因（Telegram 投递失败？脚本执行异常？）
      - [ ] 检查并修复 3 个错误状态的 Cron 任务（滚动式OS文档、私有仓库备份、夜间自我改进）

---

## 📊 系统状态

- 今日提交: 5
- 备份状态: success
- 最后备份: 2026-04-09 18:00:09

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
