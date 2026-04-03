#!/bin/bash
# ============================================================
# 自动化 1：私有仓库备份
# 功能：暂存变更 → 生成有意义提交 → 推送 → 上报状态
# 依赖：git, gh CLI
# 定时：每6小时一次，或手动触发
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="/Users/liam/.openclaw/workspace"
LOG_FILE="$SCRIPT_DIR/../logs/backup-$(date +%Y%m%d).log"
BACKUP_BRANCH="auto-backup/$(hostname)"
RETRY_COUNT=2
RETRY_DELAY=30

# GitHub repo (使用 gh CLI 自动获取)
REPO=$(git -C "$WORKSPACE" remote get-url origin 2>/dev/null | sed 's/.*github.com[/:]//' | sed 's/\.git$//' || echo "unknown")

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "[$(date '+%H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error_report() {
    log "${RED}[失败] 仓库备份异常${NC}"
    log "${RED}错误: $1${NC}"
    log "${RED}建议: 检查网络 / GitHub认证 / 仓库权限${NC}"
}

# ----------------------------------------------------------
# 前置检查
# ----------------------------------------------------------
preflight() {
    log "${BLUE}[检查] 前置检查...${NC}"
    
    if [ ! -d "$WORKSPACE/.git" ]; then
        error_report "工作目录不是Git仓库"
        exit 1
    fi
    
    # 检查 remote URL 是否配置
    if ! git -C "$WORKSPACE" remote get-url origin &>/dev/null; then
        error_report "git remote origin 未配置"
        exit 1
    fi
    
    log "${GREEN}[OK] 前置检查通过${NC}"
}

# ----------------------------------------------------------
# 变更分析 → 生成有意义的提交信息
# ----------------------------------------------------------
analyze_changes() {
    cd "$WORKSPACE"
    
    # 获取变更统计
    CHANGED=$(git status --porcelain | wc -l)
    if [ "$CHANGED" -eq 0 ]; then
        log "${YELLOW}[跳过] 没有变更需要提交${NC}"
        return 1
    fi
    
    # 分析变更类型
    ADDED=$(git status --porcelain | grep "^A" | wc -l || echo 0)
    MODIFIED=$(git status --porcelain | grep "^ M" | wc -l || echo 0)
    DELETED=$(git status --porcelain | grep "^ D" | wc -l || echo 0)
    RENAMED=$(git status --porcelain | grep "^R" | wc -l || echo 0)
    
    # 获取变更文件列表（按类型分组）
    NEW_FILES=$(git status --porcelain | grep "^A" | cut -c4- | head -5)
    MOD_FILES=$(git status --porcelain | grep "^ M" | cut -c4- | head -5)
    
    # 生成时间戳
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M")
    
    # 智能生成提交信息
    COMMIT_MSG="📦 $TIMESTAMP 自动备份"

    if [ "$RENAMED" -gt 0 ]; then
        COMMIT_MSG="$COMMIT_MSG | ${RENAMED}文件重构"
    fi
    if [ "$ADDED" -gt 0 ]; then
        COMMIT_MSG="$COMMIT_MSG | +${ADDED}新增"
    fi
    if [ "$MODIFIED" -gt 0 ]; then
        COMMIT_MSG="$COMMIT_MSG | ~${MODIFIED}修改"
    fi
    if [ "$DELETED" -gt 0 ]; then
        COMMIT_MSG="$COMMIT_MSG | -${DELETED}删除"
    fi
    
    # 如果变更多，添加详情
    if [ "$CHANGED" -gt 10 ]; then
        COMMIT_MSG="$COMMIT_MSG\n\n变更文件 ($(git status --porcelain | cut -c4- | wc -l) 个文件)"
    fi
    
    log "${GREEN}[变更] $CHANGED 个文件变更${NC}"
    log "${GREEN}[提交] $COMMIT_MSG${NC}"
}

# ----------------------------------------------------------
# 执行备份
# ----------------------------------------------------------
do_backup() {
    cd "$WORKSPACE"
    
    # 暂存
    log "${BLUE}[暂存] git add -A${NC}"
    git add -A
    
    # 生成提交
    if analyze_changes; then
        git commit -m "$COMMIT_MSG" --allow-empty
    else
        return 1
    fi
    
    # 推送（带重试）
    for i in $(seq 1 $RETRY_COUNT); do
        log "${BLUE}[推送] 尝试 $i/$RETRY_COUNT...${NC}"
        if git push origin main:$BACKUP_BRANCH 2>&1 | tee -a "$LOG_FILE"; then
            log "${GREEN}[成功] 推送到 $BACKUP_BRANCH${NC}"
            return 0
        fi
        if [ $i -lt $RETRY_COUNT ]; then
            log "${YELLOW}[重试] $RETRY_DELAY 秒后重试...${NC}"
            sleep $RETRY_DELAY
        fi
    done
    
    error_report "推送失败，尝试了 $RETRY_COUNT 次"
    return 1
}

# ----------------------------------------------------------
# 主流程
# ----------------------------------------------------------
main() {
    echo "" >> "$LOG_FILE"
    log "${BLUE}=== 仓库备份开始 ===${NC}"
    
    START_TIME=$(date +%s)
    
    if preflight && do_backup; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        log "${GREEN}=== 备份完成，耗时 ${DURATION}s ===${NC}"
        
        # 写入成功标记到状态文件
        echo "last_backup=$(date +%Y-%m-%d\ %H:%M:%S)" > "$SCRIPT_DIR/../backups/.last-backup"
        echo "status=success" >> "$SCRIPT_DIR/../backups/.last-backup"
        exit 0
    else
        # 写入失败标记
        echo "last_backup=$(date +%Y-%m-%d\ %H:%M:%S)" > "$SCRIPT_DIR/../backups/.last-backup"
        echo "status=failed" >> "$SCRIPT_DIR/../backups/.last-backup"
        exit 1
    fi
}

main "$@"
