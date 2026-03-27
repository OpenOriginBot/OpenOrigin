#!/bin/bash
# ============================================================
# 高管晨会调度脚本
# 功能：并行拉起3名主管收集汇报，生成会议纪要
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="/root/.openclaw/workspace"
MEETINGS_DIR="$WORKSPACE/team/meetings"
PROMPTS_DIR="$SCRIPT_DIR/prompts"
TODAY=$(date +%Y-%m-%d)
MEETING_DATE=$(date +%Y-%m-%d)
START_TIME=$(date +%H:%M)
TIMEOUT_SECONDS=900  # 15 minutes
MIN_WAIT_SECONDS=600 # 10 minutes minimum wait

# Ensure directories exist
mkdir -p "$MEETINGS_DIR"
mkdir -p "$PROMPTS_DIR"

# Temp files for parallel responses
TMP_DIR=$(mktemp -d)
trap "rm -rf $TMP_DIR" EXIT

OPS_RESPONSE="$TMP_DIR/ops-head.response"
MKT_RESPONSE="$TMP_DIR/mkt-head.response"
REV_RESPONSE="$TMP_DIR/rev-head.response"

OPS_STATUS="$TMP_DIR/ops-head.status"
MKT_STATUS="$TMP_DIR/mkt-head.status"
REV_STATUS="$TMP_DIR/rev-head.status"

# Meeting prompt template
get_meeting_prompt() {
    local role_emoji="$1"
    local role_name="$2"
    cat << EOF
你是 $role_emoji $role_name。

请汇报（来自项目管理看板 /api/pm-board）：
1. 当前进度（重点任务状态）
2. 阻滞问题（如有）
3. 今日承诺事项
4. 跨部门协作需求

回复格式：简洁分点，不超过200字。请直接回复汇报内容，无需声明身份。
EOF
}

# Log with timestamp
log() {
    echo "[$(date '+%H:%M:%S')] $*" | tee -a "$TMP_DIR/meeting.log"
}

# Collect response from an agent
collect_response() {
    local agent_id="$1"
    local role_emoji="$2"
    local role_name="$3"
    local output_file="$4"
    local status_file="$5"

    log "开始收集 $role_name 汇报..."
    
    local prompt=$(get_meeting_prompt "$role_emoji" "$role_name")
    
    # Run agent with timeout and capture JSON response
    local start_ts=$(date +%s)
    
    if timeout 180 openclaw agent --agent "$agent_id" --message "$prompt" --json 2>/dev/null > "$output_file"; then
        local end_ts=$(date +%s)
        local duration=$((end_ts - start_ts))
        
        # Extract text from JSON response using jq
        local response_text
        response_text=$(jq -r '.result.payloads[0].text // empty' "$output_file" 2>/dev/null || echo "")
        
        if [[ -n "$response_text" ]]; then
            echo "RESPONDED" > "$status_file"
            echo "$response_text" > "$output_file"
            log "$role_name 汇报完成 (${duration}秒)"
        else
            echo "TIMEOUT" > "$status_file"
            echo "_（未收到有效回复）_" > "$output_file"
            log "$role_name 汇报超时"
        fi
    else
        echo "TIMEOUT" > "$status_file"
        echo "_（汇报超时或出错）_" > "$output_file"
        log "$role_name 汇报失败"
    fi
}

# Main meeting flow
main() {
    log "========== 高管晨会开始 =========="
    log "日期: $MEETING_DATE"
    log "超时设置: ${TIMEOUT_SECONDS}秒"
    
    local meeting_start=$(date +%s)
    
    # Step 1: Parallel spawn all 3 agents
    log "并行启动3名主管汇报..."
    
    collect_response "ops-head" "⏱️" "运营主管" "$OPS_RESPONSE" "$OPS_STATUS" &
    collect_response "mkt-head" "✨" "营销主管" "$MKT_RESPONSE" "$MKT_STATUS" &
    collect_response "rev-head" "💰" "营收主管" "$REV_RESPONSE" "$REV_STATUS" &
    
    # Wait for all agents with minimum wait time
    local wait_end=$((meeting_start + MIN_WAIT_SECONDS))
    
    for pid in $(jobs -p); do
        # Check if we should keep waiting
        while kill -0 "$pid" 2>/dev/null; do
            local now=$(date +%s)
            if [[ $now -ge $wait_end ]]; then
                # Minimum wait satisfied, can exit even if still running
                break 2
            fi
            sleep 5
        done
    done
    
    # Wait for all background jobs to complete (or timeout)
    wait 2>/dev/null || true
    
    local collection_end=$(date +%s)
    local total_duration=$((collection_end - meeting_start))
    
    # Read responses
    local ops_text=$(cat "$OPS_RESPONSE" 2>/dev/null || echo "_（未收到汇报）_")
    local mkt_text=$(cat "$MKT_RESPONSE" 2>/dev/null || echo "_（未收到汇报）_")
    local rev_text=$(cat "$REV_RESPONSE" 2>/dev/null || echo "_（未收到汇报）_")
    
    # Read statuses
    local ops_status=$(cat "$OPS_STATUS" 2>/dev/null || echo "UNKNOWN")
    local mkt_status=$(cat "$MKT_STATUS" 2>/dev/null || echo "UNKNOWN")
    local rev_status=$(cat "$REV_STATUS" 2>/dev/null || echo "UNKNOWN")
    
    # Format status indicators
    local ops_indicator="❌超时"
    local mkt_indicator="❌超时"
    local rev_indicator="❌超时"
    [[ "$ops_status" == "RESPONDED" ]] && ops_indicator="✅正常"
    [[ "$mkt_status" == "RESPONDED" ]] && mkt_indicator="✅正常"
    [[ "$rev_status" == "RESPONDED" ]] && rev_indicator="✅正常"
    
    # Step 2: Generate meeting notes
    log "生成会议纪要..."
    
    local meeting_file="$MEETINGS_DIR/${MEETING_DATE}-每日同步会议.md"
    
    {
        cat << EOF
# 高管晨会纪要 - ${MEETING_DATE}

> ⏰ 自动生成于 $(date '+%Y-%m-%d %H:%M:%S')

---

## ⏱️ 运营主管汇报

$ops_text

---

## ✨ 营销主管汇报

$mkt_text

---

## 💰 营收主管汇报

$rev_text

---

## 跨部门协作

_（待补充）_

---

## 会议信息

| 项目 | 内容 |
|------|------|
| 时间 | ${MEETING_DATE} 08:30 |
| 时长 | 约 ${total_duration} 分钟 |
| 出席 | ⏱️运营 $ops_indicator \| ✨营销 $mkt_indicator \| 💰营收 $rev_indicator |
| 记录 | 自动生成 |

---

_由 OpenClaw 高管晨会系统自动生成_
EOF
    } > "$meeting_file"
    
    local meeting_end=$(date +%s)
    local total_time=$((meeting_end - meeting_start))
    
    log "会议纪要已保存至: $meeting_file"
    log "总耗时: ${total_time}秒"
    log "========== 高管晨会结束 =========="
    
    # Output summary
    echo ""
    echo "========================================"
    echo "高管晨会完成"
    echo "日期: $MEETING_DATE"
    echo "纪要: $meeting_file"
    echo "耗时: ${total_time}秒"
    echo "状态:"
    echo "  - ⏱️ 运营主管: $ops_indicator"
    echo "  - ✨ 营销主管: $mkt_indicator"
    echo "  - 💰 营收主管: $rev_indicator"
    echo "========================================"
}

main "$@"
