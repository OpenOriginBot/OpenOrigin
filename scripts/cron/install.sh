#!/bin/bash
# ============================================================
# 自动化任务安装脚本
# 用法：bash scripts/cron/install.sh
# ============================================================

set -euo pipefail

WORKSPACE="/root/.openclaw/workspace"
CRON_DIR="$WORKSPACE/scripts/cron"
LOG_DIR="$WORKSPACE/scripts/logs"

echo "============================================"
echo "  OpenClaw 自动化任务安装"
echo "============================================"
echo ""

# 1. 创建日志目录
echo "📁 创建日志目录..."
mkdir -p "$LOG_DIR"

# 2. 设置脚本执行权限
echo "🔧 设置脚本执行权限..."
chmod +x "$CRON_DIR"/backup/backup.sh
chmod +x "$CRON_DIR"/self-optimize/self-audit.sh
chmod +x "$CRON_DIR"/briefing/daily-briefing.sh
chmod +x "$CRON_DIR"/docs/update-docs.sh

# 3. 创建 docs 目录（如果不存在）
echo "📚 创建 docs 目录..."
mkdir -p "$WORKSPACE/docs"

# 4. 安装 crontab
echo "⏰ 安装定时任务..."
crontab "$CRON_DIR/openzclaw-crontab"

# 5. 验证安装
echo ""
echo "✅ 安装完成！"
echo ""
echo "============================================"
echo "  验证命令"
echo "============================================"
echo ""
echo "# 查看当前 crontab："
echo "crontab -l"
echo ""
echo "# 测试单个任务："
echo "bash $CRON_DIR/backup/backup.sh"
echo "bash $CRON_DIR/self-optimize/self-audit.sh"
echo "bash $CRON_DIR/briefing/daily-briefing.sh"
echo "bash $CRON_DIR/docs/update-docs.sh"
echo ""
echo "# 查看日志："
echo "ls $LOG_DIR/"
echo ""
echo "# 查看任务执行记录："
echo "tail $LOG_DIR/backup-cron.log"
echo ""
echo "============================================"
echo "  任务时间表"
echo "============================================"
echo ""
echo "🌙 02:00 - 夜间自我优化"
echo "🌅 07:30 - 每日简报"
echo "📦 每6小时 - 仓库备份"
echo "🌆 23:00 - 系统文档更新"
echo ""
echo "============================================"
echo "  必填环境变量"
echo "============================================"
echo ""
echo "在 /root/.bashrc 或环境中设置："
echo ""
echo "export GIT_REPO_URL='git@github.com:your/repo.git'"
echo "export TELEGRAM_BOT_TOKEN='your-bot-token'"
echo "export TELEGRAM_CHAT_ID='your-chat-id'"
echo ""
echo "============================================"
