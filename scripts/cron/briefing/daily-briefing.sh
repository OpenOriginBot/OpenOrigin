#!/bin/bash
# ============================================================
# 自动化任务 3：每日简报
# 功能：生成早晨摘要，包括优先级、夜间活动、待处理事项
# 输出：Markdown 保存到 memory/YYYY-MM-DD.md + 可选消息推送
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="/root/.openclaw/workspace"
MEMORY_DIR="$WORKSPACE/memory"
BRIEFING_DIR="$WORKSPACE/briefings"
TODAY=$(date +%Y-%m-%d)
YESTERDAY=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d 2>/dev/null)
TIMEZONE="${TIMEZONE:-Asia/Shanghai}"

TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
ENABLE_TELEGRAM="${ENABLE_TELEGRAM:-false}"

mkdir -p "$MEMORY_DIR" "$BRIEFING_DIR"

TODAY_FILE="$MEMORY_DIR/$TODAY.md"

log_section() {
    echo "$1" >> "$TODAY_FILE"
}

send_telegram() {
    local msg="$1"
    if [[ "$ENABLE_TELEGRAM" == "true" && -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
        curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
            -d "chat_id=$TELEGRAM_CHAT_ID" \
            -d "text=$msg" \
            -d "parse_mode=Markdown" \
            > /dev/null 2>&1 || true
    fi
}

get_yesterday_summary() {
    local summary=""
    if [[ -f "$MEMORY_DIR/$YESTERDAY.md" ]]; then
        summary=$(grep -A 50 "## 任务记录" "$MEMORY_DIR/$YESTERDAY.md" 2>/dev/null | head -30)
    fi
    echo "$summary"
}

get_today_priority() {
    # 从 MEMORY.md 读取当前优先级
    local priorities=""
    if [[ -f "$WORKSPACE/MEMORY.md" ]]; then
        priorities=$(grep -A 5 "## 📌 当前项目状态" "$WORKSPACE/MEMORY.md" 2>/dev/null || echo "")
    fi
    echo "$priorities"
}

get_pending_todos() {
    local todos=""
    if [[ -f "$WORKSPACE/HEARTBEAT.md" ]]; then
        todos=$(grep -v "^#" "$WORKSPACE/HEARTBEAT.md" | grep -v "^$" | grep -v "HEARTBEAT_OK" | head -5)
    fi
    
    # 检查 memory/ 中的待办
    find "$MEMORY_DIR" -name "*.md" -mtime -2 ! -name "$TODAY.md" 2>/dev/null | while read -r f; do
        local todo
        todo=$(grep "\- \[ \]" "$f" 2>/dev/null | head -3)
        if [[ -n "$todo" ]]; then
            todos="$todos"$'\n'"[$(basename "$f")]:"$'\n'"$todo"
        fi
    done
    
    echo "$todos"
}

get_active_projects() {
    local projects=""
    if [[ -f "$WORKSPACE/MEMORY.md" ]]; then
        projects=$(grep -A 10 "## 🏭 供应商网络" "$WORKSPACE/MEMORY.md" 2>/dev/null | head -15 || echo "")
    fi
    echo "$projects"
}

get_undelivered_orders() {
    # 从 OpenZeno 数据读取（如果有）
    local orders=""
    if [[ -f "$WORKSPACE/projects/openzeno/src/data/ops-tasks.json" ]]; then
        local pending
        pending=$(grep -c '"status":"pending"' "$WORKSPACE/projects/openzeno/src/data/ops-tasks.json" 2>/dev/null || echo "0")
        orders="Ops 模块待处理任务: $pending"
    fi
    echo "$orders"
}

main() {
    echo "========== 生成每日简报 =========="
    
    # 创建/更新今日文件
    {
        echo "# 📋 每日简报 - $TODAY"
        echo ""
        echo "**生成时间：** $(date '+%H:%M') ($TIMEZONE)"
        echo ""
        
        echo "## 🎯 今日优先级"
        echo ""
        local priority
        priority=$(get_today_priority)
        if [[ -n "$priority" ]]; then
            echo "$priority"
        else
            echo "_从 MEMORY.md 加载_"
        fi
        echo ""
        
        echo "## 📦 运营状态"
        echo ""
        local orders
        orders=$(get_undelivered_orders)
        if [[ -n "$orders" ]]; then
            echo "- $orders"
        fi
        echo ""
        
        echo "## 🌙 昨夜活动"
        echo ""
        local yesterday
        yesterday=$(get_yesterday_summary)
        if [[ -n "$yesterday" ]]; then
            echo "$yesterday"
        else
            echo "_无昨夜记录_"
        fi
        echo ""
        
        echo "## ⏳ 待处理事项"
        echo ""
        local todos
        todos=$(get_pending_todos)
        if [[ -n "$todos" ]]; then
            echo "$todos"
        else
            echo "_无待处理事项_"
        fi
        echo ""
        
        echo "## 📊 项目状态"
        echo ""
        local projects
        projects=$(get_active_projects)
        if [[ -n "$projects" ]]; then
            echo "$projects"
        else
            echo "_从 MEMORY.md 加载_"
        fi
        echo ""
        
        echo "## 💬 备注"
        echo ""
        echo "_在此添加今日备注..._"
        echo ""
        
        echo "---"
        echo "_由 OpenClaw 自动化生成_"
    } > "$TODAY_FILE"
    
    echo "简报已保存至: $TODAY_FILE"
    
    # 生成简短版本发送到 Telegram
    if [[ "$ENABLE_TELEGRAM" == "true" ]]; then
        local brief_msg="📋 *每日简报 - $TODAY*

🎯 *今日重点：*
_从 MEMORY.md 读取_

⏳ *待处理：*
_检查 Ops 模块_

🌙 *昨夜：*
_查看完整简报_"
        send_telegram "$brief_msg"
        echo "Telegram 通知已发送"
    fi
    
    # 同时复制一份到 briefings 目录（供 OpenZeno Brain 模块使用）
    cp "$TODAY_FILE" "$BRIEFING_DIR/$TODAY.md"
    echo "已同步到 briefings/ 目录"
    
    echo "========== 简报生成完成 =========="
}

main "$@"
