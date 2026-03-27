# OpenClaw 自动化任务 - 配置指南

## 📁 文件结构

```
scripts/cron/
├── backup/
│   └── backup.sh              # 任务1：私有仓库备份
├── self-optimize/
│   └── self-audit.sh          # 任务2：夜间自我优化
├── briefing/
│   └── daily-briefing.sh      # 任务3：每日简报
├── docs/
│   └── update-docs.sh         # 任务4：滚动式系统文档
├── openzclaw-crontab          # Crontab 配置
├── install.sh                 # 安装脚本
└── rollback.sh               # 回滚脚本
```

---

## 🚀 快速安装

```bash
cd /root/.openclaw/workspace
bash scripts/cron/install.sh
```

---

## ⚙️ 环境变量配置

在 `/root/.bashrc` 或系统环境中添加：

```bash
# Git 私有仓库（必须）
export GIT_REPO_URL='git@github.com:your/private-repo.git'

# Telegram 通知（可选）
export TELEGRAM_BOT_TOKEN='your-bot-token'
export TELEGRAM_CHAT_ID='your-chat-id'
export ENABLE_TELEGRAM='true'

# 时区
export TIMEZONE='Asia/Shanghai'
```

**应用环境变量：**
```bash
source /root/.bashrc
```

---

## ⏰ 定时任务时间表

| 时间 | 任务 | 说明 |
|------|------|------|
| 02:00 | 夜间自我优化 | 文档审计、清理、改进建议 |
| 07:30 | 每日简报 | 生成早晨摘要 |
| 每6小时 | 仓库备份 | 变更提交推送 |
| 23:00 | 系统文档更新 | 更新 SYSTEM-REFERENCE.md |

---

## 📋 手动测试命令

```bash
# 测试备份任务
bash scripts/cron/backup/backup.sh

# 测试夜间优化
bash scripts/cron/self-optimize/self-audit.sh

# 测试每日简报
bash scripts/cron/briefing/daily-briefing.sh

# 测试文档更新
bash scripts/cron/docs/update-docs.sh
```

---

## 🔧 回滚 / 恢复操作

```bash
# 卸载所有定时任务
bash scripts/cron/rollback.sh uninstall

# 暂停定时任务（保留配置）
bash scripts/cron/rollback.sh disable

# 恢复定时任务
bash scripts/cron/rollback.sh enable

# 从 Git 恢复 docs/ 目录
bash scripts/cron/rollback.sh restore-docs

# 从 Git 恢复 memory/ 目录
bash scripts/cron/rollback.sh restore-memory

# 完整重置
bash scripts/cron/rollback.sh full-reset

# 清理7天前日志
bash scripts/cron/rollback.sh log-cleanup

# 查看状态
bash scripts/cron/rollback.sh status
```

---

## 📊 验证清单（15分钟）

### 安装后验证（5分钟）
- [ ] `crontab -l` 显示4个任务
- [ ] 所有脚本有执行权限 (`ls -la *.sh` 显示 `-rwx`)
- [ ] `scripts/logs/` 目录已创建
- [ ] `docs/` 目录已创建

### 功能验证（5分钟）
- [ ] `bash backup/backup.sh` 执行无报错
- [ ] `bash self-optimize/self-audit.sh` 生成报告到 memory/
- [ ] `bash briefing/daily-briefing.sh` 生成今日简报
- [ ] `bash docs/update-docs.sh` 生成 SYSTEM-REFERENCE.md

### 通知验证（5分钟）
- [ ] 设置 TELEGRAM_BOT_TOKEN 和 TELEGRAM_CHAT_ID
- [ ] `bash briefing/daily-briefing.sh` 测试 Telegram 通知
- [ ] 模拟备份失败，确认 Telegram 告警收到

---

## 🔄 工作流程

### 备份任务流程
```
1. 检查是否有变更
2. 生成有意义提交信息（基于变更类型）
3. git add → git commit
4. git push（最多重试3次）
5. 失败时发送 Telegram 告警
```

### 夜间优化流程
```
1. 审计文档一致性（缺失/占位符/空文件）
2. 审计待办清单（过期/未完成）
3. 审计内部链接（失效引用）
4. 审计过期文件（30天+未修改）
5. 审计提示词效率
6. 应用低风险修复（清理空文件/临时文件/换行符）
7. 生成报告到 memory/YYYY-MM-DD-audit.md
```

### 每日简报流程
```
1. 读取今日优先级（从 MEMORY.md）
2. 检查昨夜活动（从昨日 memory/）
3. 收集待处理事项
4. 更新 Ops 模块状态
5. 保存到 memory/YYYY-MM-DD.md
6. 同步到 briefings/YYYY-MM-DD.md（供 OpenZeno Brain 模块）
7. 可选：发送 Telegram 摘要
```

### 系统文档流程
```
1. 分析 Git 变更（自上次更新）
2. 更新架构概览
3. 更新模块清单
4. 更新 API 路由
5. 更新活跃进程
6. 更新近期文件（7天内）
7. 记录已知问题
8. 更新 SYSTEM-REFERENCE.md
```

---

## 🛡️ 安全考虑

- **Git 凭证：** 使用 SSH Key，避免明文密码
- **Telegram Token：** 仅用于告警，不含敏感操作
- **只读备份：** 备份任务只推送到指定仓库
- **隔离执行：** 每个任务独立运行，互不影响

---

## 📝 Crontab 格式参考

```bash
# ┌───────────── 分钟 (0 - 59)
# │ ┌─────────── 小时 (0 - 23)
# │ │ ┌───────── 日期 (1 - 31)
# │ │ │ ┌─────── 月份 (1 - 12)
# │ │ │ │ ┌───── 星期 (0 - 6, 周日=0)
# │ │ │ │ │
# │ │ │ │ │
# * * * * * command

# 每6小时
0 */6 * * *

# 每天 02:00
0 2 * * *

# 每天 07:30
30 7 * * *

# 每天 23:00
0 23 * * *
```

---

_最后更新：2026-03-27_
