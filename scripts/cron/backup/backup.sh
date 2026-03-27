#!/bin/bash
# ============================================================
# 自动化任务 1：私有仓库备份
# 功能：暂存变更 → 有意义提交 → 推送到 GitHub → 失败上报
# 依赖：git, curl（用于消息通知）
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="/root/.openclaw/workspace"
LOG_DIR="$SCRIPT_DIR/../logs"
LOG_FILE="$LOG_DIR/backup-$(date +%Y%m%d).log"
PRIVATE_REPO_URL="${GIT_REPO_URL:-}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"
MAX_RETRIES=3
RETRY_DELAY=30

mkdir -p "$LOG_DIR"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify_failure() {
    local msg="$1"
    log "FAILURE: $msg"
    if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
        curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
            -d "chat_id=$TELEGRAM_CHAT_ID" \
            -d "text=⚠️ [OpenClaw Backup Failed]%0A$msg" \
            > /dev/null 2>&1 || true
    fi
}

git_commit_message() {
    local changed_files
    local additions=0
    local deletions=0
    
    cd "$WORKSPACE"
    
    if [[ $(git status --porcelain | wc -l) -eq 0 ]]; then
        echo "NO_CHANGE"
        return 1
    fi
    
    changed_files=$(git status --porcelain | wc -l)
    
    # 统计变更行数
    local diff_stats
    diff_stats=$(git diff --stat --shortstat 2>/dev/null || echo "")
    
    # 生成有意义的消息
    local msg_parts=()
    
    if git status --porcelain | grep -q "^M "; then
        local modified
        modified=$(git status --porcelain | grep "^M " | wc -l)
        msg_parts+=("修改 $modified 个文件")
    fi
    
    if git status --porcelain | grep -q "^A "; then
        local added
        added=$(git status --porcelain | grep "^A " | wc -l)
        msg_parts+=("新增 $added 个文件")
    fi
    
    if git status --porcelain | grep -q "^D "; then
        local deleted
        deleted=$(git status --porcelain | grep "^D " | wc -l)
        msg_parts+=("删除 $deleted 个文件")
    fi
    
    if git status --porcelain | grep -q "^??"; then
        local untracked
        untracked=$(git status --porcelain | grep "^??" | wc -l)
        msg_parts+=("未跟踪 $untracked 个文件")
    fi
    
    local timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M')
    
    if [[ ${#msg_parts[@]} -eq 0 ]]; then
        echo "📝 [$timestamp] 工作区更新"
    else
        echo "📝 [$timestamp] ${msg_parts[*]}"
    fi
}

retry_git_push() {
    local retries=0
    local last_error=""
    
    while [[ $retries -lt $MAX_RETRIES ]]; do
        if git push origin "$(git rev-parse --abbrev-ref HEAD)" 2>&1 | tee -a "$LOG_FILE"; then
            return 0
        fi
        last_error=$(tail -1 "$LOG_FILE")
        retries=$((retries + 1))
        log "Push 重试 $retries/$MAX_RETRIES，等待 ${RETRY_DELAY}s..."
        sleep "$RETRY_DELAY"
    done
    
    echo "$last_error"
    return 1
}

main() {
    log "========== 开始备份任务 =========="
    
    if [[ -z "$PRIVATE_REPO_URL" ]]; then
        notify_failure "GIT_REPO_URL 未配置"
        exit 1
    fi
    
    cd "$WORKSPACE"
    
    # 配置 Git（如果需要）
    git config --local user.email "openclaw@auto.backup" 2>/dev/null || true
    git config --local user.name "OpenClaw Auto Backup" 2>/dev/null || true
    
    # 检查变更
    if [[ $(git status --porcelain | wc -l) -eq 0 ]]; then
        log "无变更，跳过提交"
        exit 0
    fi
    
    # 生成提交信息
    local commit_msg
    commit_msg=$(git_commit_message) || {
        log "无法生成提交信息，跳过"
        exit 0
    }
    
    if [[ "$commit_msg" == "NO_CHANGE" ]]; then
        log "无变更，跳过提交"
        exit 0
    fi
    
    # 添加所有变更
    log "暂存变更..."
    git add -A
    
    # 提交
    log "提交: $commit_msg"
    if ! git commit -m "$commit_msg" 2>&1 | tee -a "$LOG_FILE"; then
        notify_failure "Git 提交失败"
        exit 1
    fi
    
    # 推送（带重试）
    log "推送到远程仓库..."
    if ! retry_git_push; then
        notify_failure "Git 推送失败（已重试 $MAX_RETRIES 次）"
        exit 1
    fi
    
    log "========== 备份完成 =========="
}

main "$@" 2>&1 | tee -a "$LOG_FILE"
