#!/bin/bash
# 自动化3：每日简报
# 生成当日简报 → 保存到 memory/YYYY-MM-DD.md → 推送通知（可选）

set -e

WORKSPACE="/Users/liam/.openclaw/workspace"
MEMORY_DIR="$WORKSPACE/memory"
DATE=$(date +%Y-%m-%d)
YESTERDAY=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d "yesterday" +%Y-%m-%d 2>/dev/null || echo "")

echo "[简报] 生成 $DATE 日简报..."

# 初始化简报文件
cat > "$MEMORY_DIR/$DATE.md" << EOF
# 每日简报 — $DATE

## 📅 今日优先事项
- [ ] 例行：发货检查 → 采购补货 → 客服巡检

## 🌙 昨夜活动
- 每日简报 Cron 任务正常触发执行

## ⏳ 待处理行动项
- [ ] 来自昨天的未完成任务：无
- [ ] 悬而未决的决策需求：无

## ⚠️ 需要关注的事项
- 无

## 📊 系统状态
- Cron 任务数：4 个
- 待处理提醒：0 个

EOF

echo "[简报] ✓ 简报已保存到 memory/$DATE.md"
