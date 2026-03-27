#!/bin/bash
# ============================================================
# 高管晨会定时任务调用脚本
# 由 cron 在工作日上午 8:30 执行
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEETING_SCRIPT="$SCRIPT_DIR/../morning-meeting/meeting.sh"
LOG_DIR="$SCRIPT_DIR/../logs"
TODAY=$(date +%Y-%m-%d)

# 确保日志目录存在
mkdir -p "$LOG_DIR"

# 执行会议脚本，日志同时输出到文件和控制台
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始执行高管晨会..." >> "$LOG_DIR/morning-meeting-$(date +%Y-%m-%d).log"

bash "$MEETING_SCRIPT" 2>&1 | tee -a "$LOG_DIR/morning-meeting-$(date +%Y-%m-%d).log"

exit ${PIPESTATUS[0]}
