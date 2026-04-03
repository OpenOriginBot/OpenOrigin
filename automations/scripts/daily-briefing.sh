#!/bin/bash
# ============================================================
# 自动化 3：每日简报
# 功能：生成早晨摘要 → 保存文件 → 可推送通知
# 定时：每天 08:30 自动运行
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="/Users/liam/.openclaw/workspace"
LOG_FILE="$SCRIPT_DIR/../logs/briefing-$(date +%Y%m%d).log"
MEMORY_DIR="$WORKSPACE/memory"
TODAY=$(date +%Y-%m-%d)
BRIEFING_FILE="$MEMORY_DIR/briefing-${TODAY}.md"

# 夜间活动时间段 (昨晚18:00到今早08:00)
YESTERDAY=$(python3 -c "from datetime import datetime,timedelta; print((datetime.now()-timedelta(days=1)).strftime('%Y-%m-%d'))" 2>/dev/null || date -v-1d +%Y-%m-%d)

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
    echo -e "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# ----------------------------------------------------------
# 收集昨日变更
# ----------------------------------------------------------
gather_changes() {
    log "${BLUE}[收集] 昨日变更记录...${NC}"
    
    local changes=""
    
    # Git 昨日提交
    local git_logs=$(git -C "$WORKSPACE" log --since="$YESTERDAY 00:00" --until="$TODAY 00:00" --oneline 2>/dev/null || echo "")
    if [ -n "$git_logs" ]; then
        changes="$changes\n\n**Git 提交 ($(echo "$git_logs" | wc -l | tr -d ' ') 个):**\n$(echo "$git_logs" | head -10 | sed 's/^/  /')"
    fi
    
    # 新增/修改的文件
    local file_logs=$(git -C "$WORKSPACE" diff --name-only --since="$YESTERDAY 00:00" 2>/dev/null | head -20)
    if [ -n "$file_logs" ]; then
        changes="$changes\n\n**变更文件:**\n$(echo "$file_logs" | sed 's/^/  - /')"
    fi
    
    [ -z "$changes" ] && changes="\n无记录"
    echo -e "$changes"
}

# ----------------------------------------------------------
# 读取昨日 memory
# ----------------------------------------------------------
read_yesterday_memory() {
    local memofile="$MEMORY_DIR/${YESTERDAY}.md"
    if [ -f "$memofile" ]; then
        grep -E "^## |^\-\[ \]|^###" "$memofile" | head -30
    else
        echo "无"
    fi
}

# ----------------------------------------------------------
# 读取待处理事项
# ----------------------------------------------------------
gather_pending() {
    local pending=""
    
    # 从 memory 文件中提取未完成待办
    for memofile in "$MEMORY_DIR"/*.md; do
        [ -f "$memofile" ] || continue
        [[ ! "$memofile" =~ $TODAY ]] || continue
        
        local todos=$(grep -E "\- \[ \]" "$memofile" 2>/dev/null | head -10)
        [ -n "$todos" ] && pending="$pending\n$(basename $memofile):\n$(echo "$todos" | sed 's/^/  /')"
    done
    
    [ -z "$pending" ] && pending="\n无待处理事项" || true
    echo -e "$pending"
}

# ----------------------------------------------------------
# 统计汇总
# ----------------------------------------------------------
gather_stats() {
    log "${BLUE}[统计] 汇总数据...${NC}"
    
    local stats=""
    
    # Git 活动
    local commit_count=$(git -C "$WORKSPACE" log --since="$YESTERDAY 00:00" --until="$TODAY 00:00" --oneline 2>/dev/null | wc -l | tr -d ' ' || echo "0")
    stats="$stats\n- 提交数: $commit_count"
    
    # 文件变更
    local file_count=$(git -C "$WORKSPACE" diff --name-only --since="$YESTERDAY 00:00" 2>/dev/null | wc -l | tr -d ' ' || echo "0")
    stats="$stats\n- 变更文件: $file_count"
    
    # 工作空间大小
    local ws_size=$(du -sh "$WORKSPACE" 2>/dev/null | cut -f1 || echo "unknown")
    stats="$stats\n- 工作空间: $ws_size"
    
    # Memory 条目
    local memo_count=$(ls "$MEMORY_DIR"/*.md 2>/dev/null | wc -l | tr -d ' ' || echo "0")
    stats="$stats\n- Memory文件: $memo_count"
    
    echo -e "$stats"
}

# ----------------------------------------------------------
# 生成简报
# ----------------------------------------------------------
generate_briefing() {
    log "${BLUE}[生成] 每日简报...${NC}"
    
    local changes=$(gather_changes)
    local yesterday=$(read_yesterday_memory)
    local pending=$(gather_pending)
    local stats=$(gather_stats)
    
    local HOUR=$(date +%H)
    local GREETING="早上好"
    [ "$HOUR" -ge 12 ] && GREETING="下午好"
    [ "$HOUR" -ge 18 ] && GREETING="晚上好"
    
    cat > "$BRIEFING_FILE" << EOF
# 每日简报 ${TODAY}

> ${GREETING}，老板。这是您的每日运营摘要。

---

## 📊 今日优先级

EOF

    # 动态优先级
    local commit_count=$(git -C "$WORKSPACE" log --since="$YESTERDAY 00:00" --until="$TODAY 00:00" --oneline 2>/dev/null | wc -l | tr -d ' ' || echo "0")
    
    if [ "$commit_count" -gt 5 ]; then
        echo "- ⚡ 高活动日：昨天有 $commit_count 个提交，注意检查变更质量" >> "$BRIEFING_FILE"
    else
        echo "- 日常维护：按计划推进" >> "$BRIEFING_FILE"
    fi
    
    # 检查是否有失败任务
    if grep -q "status=failed" "$SCRIPT_DIR/../backups/.last-backup" 2>/dev/null; then
        echo "- 🔴 注意：上次备份失败，需要检查" >> "$BRIEFING_FILE"
    fi
    
    cat >> "$BRIEFING_FILE" << EOF

---

## 🌙 夜间活动（$YESTERDAY）

$stats

### 提交记录
$changes

---

## 📋 待处理事项

$pending

---

## 📝 昨日记忆回顾

$yesterday

---

## 🔔 需要您关注

EOF

    # 自动提取需要关注的事项
    local attention_needed=0
    
    if grep -q "status=failed" "$SCRIPT_DIR/../backups/.last-backup" 2>/dev/null; then
        echo "- 🚨 GitHub 备份失败，请检查认证状态" >> "$BRIEFING_FILE"
        ((attention_needed++))
    fi
    
    # 检查逾期待办
    for memofile in "$MEMORY_DIR"/*.md; do
        [[ ! "$memofile" =~ $TODAY ]] || continue
        if grep -qE "\[ \].*20[0-9]{2}-[0-9]{2}-[0-9]{2}" "$memofile" 2>/dev/null; then
            echo "- ⏰ 有逾期待办在 $(basename $memofile)" >> "$BRIEFING_FILE"
            ((attention_needed++))
            break
        fi
    done
    
    [ "$attention_needed" -eq 0 ] && echo "- ✅ 无紧急事项" >> "$BRIEFING_FILE"
    
    cat >> "$BRIEFING_FILE" << EOF

---

## 🕐 时间戳

生成时间: $(date "+%Y-%m-%d %H:%M:%S %Z")
EOF

    log "${GREEN}[完成] 简报已保存: $BRIEFING_FILE${NC}"
}

# ----------------------------------------------------------
# 推送通知（可选）
# ----------------------------------------------------------
send_notification() {
    log "${BLUE}[推送] 发送通知...${NC}"
    
    # 检查是否有 tg/gh CLI 等通知渠道配置
    if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
        local msg="📋 *每日简报 ${TODAY}*
        
\`\`\`
$(head -30 "$BRIEFING_FILE")
\`\`\`"
        
        curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}&text=${msg}&parse_mode=Markdown" &>/dev/null || true
        log "${GREEN}[推送] Telegram 通知已发送${NC}"
    else
        log "${YELLOW}[跳过] 未配置推送渠道${NC}"
    fi
}

# ----------------------------------------------------------
# 主流程
# ----------------------------------------------------------
main() {
    echo "" >> "$LOG_FILE"
    log "${BLUE}=== 每日简报生成开始 ===${NC}"
    
    mkdir -p "$MEMORY_DIR"
    generate_briefing
    
    # 仅在明确配置时推送
    if [ "${SEND_NOTIFICATION:-false}" = "true" ]; then
        send_notification
    fi
    
    log "${GREEN}=== 简报完成 ===${NC}"
}

main "$@"
