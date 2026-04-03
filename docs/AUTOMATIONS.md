# OpenOrigin 自动化任务文档

> 四个核心自动化任务，所有脚本位于 `automations/scripts/`

---

## 目录

- [快速开始](#快速开始)
- [自动化 1：私有仓库备份](#自动化-1私有仓库备份)
- [自动化 2：夜间自我优化](#自动化-2夜间自我优化)
- [自动化 3：每日简报](#自动化-3每日简报)
- [自动化 4：滚动式操作系统文档](#自动化-4滚动式操作系统文档)
- [定时任务规则](#定时任务规则)
- [验证命令](#验证命令)
- [回滚与恢复](#回滚与恢复)

---

## 快速开始

### 安装依赖

```bash
# GitHub CLI 认证（用于 backup-repo）
gh auth login

# 确保脚本有执行权限
chmod +x automations/scripts/*.sh
```

### 测试运行

```bash
# 测试备份
./automations/scripts/backup-repo.sh

# 测试简报生成
./automations/scripts/daily-briefing.sh

# 测试自我优化
./automations/scripts/self-optimize.sh

# 测试文档更新
./automations/scripts/update-docs.sh
```

---

## 自动化 1：私有仓库备份

### 功能
- 自动检测工作区变更
- 生成有意义的提交信息（基于变更类型和数量）
- 推送到私有 GitHub 仓库的 `auto-backup/[hostname]` 分支
- 失败重试 2 次 + 详细错误报告

### 脚本位置
```
automations/scripts/backup-repo.sh
```

### 配置
```bash
# 设置仓库（自动检测）
# 无需手动配置

# 可选：设置 GitHub API token（如果 gh CLI 有问题）
export GITHUB_TOKEN="your_token_here"
```

### 定时规则
```cron
# 每6小时备份一次
0 */6 * * * /Users/liam/.openclaw/workspace/automations/scripts/backup-repo.sh >> /Users/liam/.openclaw/workspace/automations/logs/backup-cron.log 2>&1

# 每天凌晨3点备份（低峰期）
0 3 * * * /Users/liam/.openclaw/workspace/automations/scripts/backup-repo.sh >> /Users/liam/.openclaw/workspace/automations/logs/backup-cron.log 2>&1
```

### 验证
```bash
# 检查上次备份状态
cat automations/backups/.last-backup

# 查看备份日志
tail -20 automations/logs/backup-$(date +%Y%m%d).log

# 验证推送成功
git ls-remote origin | grep auto-backup
```

---

## 自动化 2：夜间自我优化

### 功能
- 审计 5 个领域：文档偏差、待办清单、失效链接、过期文件、低效提示词
- 自动执行低风险修复（末尾空白、重复空行）
- 生成得分（100分制）并记录到 `memory/YYYY-MM-DD.md`

### 脚本位置
```
automations/scripts/self-optimize.sh
```

### 审计项目

| 审计项 | 检查内容 | 扣分 |
|--------|----------|------|
| 文档偏差 | 失效链接、TODO超期 | 3-5分/项 |
| 待办整洁 | 逾期待办、待办积压 | 2-5分/项 |
| 失效链接 | http链接可访问性 | 3分/项 |
| 过期文件 | 临时缓存、过期日志、空文档 | 1分/项 |
| 提示词效率 | 过长提示词、重复约束 | 1-2分/项 |

### 定时规则
```cron
# 每天凌晨2点
0 2 * * * /Users/liam/.openclaw/workspace/automations/scripts/self-optimize.sh >> /Users/liam/.openclaw/workspace/automations/logs/optimize-cron.log 2>&1
```

### 验证
```bash
# 查看今日审计结果
cat memory/$(date +%Y-%m-%d).md | grep -A 20 "夜间优化"

# 检查得分
grep "审计得分" memory/$(date +%Y-%m-%d).md
```

### 低风险修复列表
- ✅ 去除文件末尾空白（仅 .md, .txt, .sh）
- ✅ 清理连续重复空行
- ❌ 不删除任何文件
- ❌ 不修改核心逻辑

---

## 自动化 3：每日简报

### 功能
- 汇总今日优先级
- 记录夜间活动（Git提交、文件变更）
- 提取待处理事项
- 生成 Markdown 格式简报

### 脚本位置
```
automations/scripts/daily-briefing.sh
```

### 输出
- 文件：`memory/briefing-YYYY-MM-DD.md`
- 可选推送：Telegram（需配置 `SEND_NOTIFICATION=true`）

### 定时规则
```cron
# 每天早上8:30
30 8 * * * /Users/liam/.openclaw/workspace/automations/scripts/daily-briefing.sh >> /Users/liam/.openclaw/workspace/automations/logs/briefing-cron.log 2>&1
```

### Telegram 推送配置
```bash
export TELEGRAM_BOT_TOKEN="your_bot_token"
export TELEGRAM_CHAT_ID="your_chat_id"
export SEND_NOTIFICATION=true
```

### 验证
```bash
# 查看今日简报
cat memory/briefing-$(date +%Y-%m-%d).md

# 检查是否生成
ls -la memory/briefing-*.md
```

---

## 自动化 4：滚动式操作系统文档

### 功能
- 分析今日所有变更（Git + 文件系统）
- 自动更新 `docs/SYSTEM-REFERENCE.md`
- 保持文档与实际系统同步

### 脚本位置
```
automations/scripts/update-docs.sh
```

### 更新内容
1. 今日变更记录
2. 当前架构概览
3. 模块清单
4. 活跃定时任务
5. 已知问题汇总
6. 系统状态
7. 回滚指南

### 定时规则
```cron
# 每天晚上23:00
0 23 * * * /Users/liam/.openclaw/workspace/automations/scripts/update-docs.sh >> /Users/liam/.openclaw/workspace/automations/logs/docs-cron.log 2>&1
```

### 验证
```bash
# 查看文档更新状态
grep "上次更新" docs/SYSTEM-REFERENCE.md

# 查看今日变更记录
grep -A 30 "今日变更" docs/SYSTEM-REFERENCE.md

# 检查文档历史
git log --oneline docs/SYSTEM-REFERENCE.md | head -5
```

---

## 定时任务规则

### 推荐 cron 表达式

```cron
# OpenOrigin 完整自动化套件
30 8 * * * /Users/liam/.openclaw/workspace/automations/scripts/daily-briefing.sh >> /Users/liam/.openclaw/workspace/automations/logs/briefing-cron.log 2>&1
0 2 * * * /Users/liam/.openclaw/workspace/automations/scripts/self-optimize.sh >> /Users/liam/.openclaw/workspace/automations/logs/optimize-cron.log 2>&1
0 23 * * * /Users/liam/.openclaw/workspace/automations/scripts/update-docs.sh >> /Users/liam/.openclaw/workspace/automations/logs/docs-cron.log 2>&1
0 */6 * * * /Users/liam/.openclaw/workspace/automations/scripts/backup-repo.sh >> /Users/liam/.openclaw/workspace/automations/logs/backup-cron.log 2>&1
```

### macOS 上安装 crontab

```bash
# 编辑 crontab
crontab -e

# 查看现有任务
crontab -l

# 删除所有任务
crontab -r
```

### 使用 launchd（推荐 macOS）

```bash
# 创建 plist
~/Library/LaunchAgents/com.openorigin.backup.plist
~/Library/LaunchAgents/com.openorigin.optimize.plist
```

---

## 验证命令

### 整体健康检查
```bash
# 1. 检查日志目录
ls -la automations/logs/

# 2. 检查备份状态
cat automations/backups/.last-backup

# 3. 检查最新日志
tail -5 automations/logs/backup-$(date +%Y%m%d).log
tail -5 automations/logs/optimize-$(date +%Y%m%d).log
tail -5 automations/logs/briefing-$(date +%Y%m%d).log
tail -5 automations/logs/docs-update-$(date +%Y%m%d).log

# 4. 验证 SYSTEM-REFERENCE.md 是最新的
grep "上次更新" docs/SYSTEM-REFERENCE.md
```

### 失败告警检查
```bash
# 检查是否有失败状态
grep -l "status=failed" automations/backups/.last-backup 2>/dev/null && echo "⚠️ 有备份失败"

# 检查错误日志
grep -i "error\|failed\|异常" automations/logs/*-$(date +%Y%m%d).log | tail -10
```

---

## 回滚与恢复

### 1. 撤销 Git 提交

```bash
# 查看最近提交
git log --oneline -10

# 方式A：创建新提交来撤销（安全）
git revert <commit-hash>

# 方式B：强制回退（危险，会改写历史）
git reset --hard <commit-hash>
git push --force
```

### 2. 恢复被覆盖的文档

```bash
# 查看文档历史
git log --follow docs/SYSTEM-REFERENCE.md

# 恢复特定版本
git show HEAD~1:docs/SYSTEM-REFERENCE.md > docs/SYSTEM-REFERENCE.md

# 或者恢复到上一次的 commit
git checkout HEAD~1 -- docs/SYSTEM-REFERENCE.md
```

### 3. 恢复误删的文件

```bash
# 查找删除的文件的 commit
git log --diff-filter=D --summary --all -- "**/filename.md"

# 恢复文件
git checkout <commit-hash>^ -- "path/to/deleted/file"
```

### 4. 恢复 memory 文件

```bash
# memory/ 目录也在版本控制中
git checkout HEAD~1 -- memory/2026-04-03.md
```

### 5. 紧急回滚所有自动化

```bash
# 如果自动化脚本破坏了文件
git checkout HEAD -- .

# 只恢复 docs/
git checkout HEAD -- docs/

# 只恢复 memory/
git checkout HEAD -- memory/
```

### 6. 禁用自动化

```bash
# 临时禁用所有 crontab
crontab -r

# 删除 launchd plist
rm ~/Library/LaunchAgents/com.openorigin.*.plist
launchctl unload ~/Library/LaunchAgents/com.openorigin.*.plist
```

---

## 目录结构

```
automations/
├── scripts/
│   ├── backup-repo.sh       # 仓库备份
│   ├── self-optimize.sh     # 夜间优化
│   ├── daily-briefing.sh    # 每日简报
│   └── update-docs.sh       # 文档更新
├── logs/
│   ├── backup-YYYYMMDD.log
│   ├── optimize-YYYYMMDD.log
│   ├── briefing-YYYYMMDD.log
│   └── docs-update-YYYYMMDD.log
└── backups/
    └── .last-backup         # 备份状态
```

---

_最后更新：2026-04-03_
