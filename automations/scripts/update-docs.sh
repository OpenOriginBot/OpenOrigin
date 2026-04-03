#!/bin/bash
# ============================================================
# 自动化 4：滚动式操作系统文档
# 功能：分析变更 → 更新 SYSTEM-REFERENCE.md
# 定时：每天 23:00 自动运行
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="/Users/liam/.openclaw/workspace"
LOG_FILE="$SCRIPT_DIR/../logs/docs-update-$(date +%Y%m%d).log"
TODAY=$(date +%Y-%m-%d)
DOCS_FILE="$WORKSPACE/docs/SYSTEM-REFERENCE.md"
TMP_FILE="/tmp/sysref-${TODAY}-$$.md"

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
# 收集今日变更
# ----------------------------------------------------------
collect_today_changes() {
    log "${BLUE}[分析] 今日变更...${NC}"
    
    local changes=""
    
    # Git 今日变更
    local git_today=$(git -C "$WORKSPACE" log --since="${TODAY} 00:00" --until="now" --oneline 2>/dev/null || echo "")
    if [ -n "$git_today" ]; then
        changes="$changes\n\n**今日提交 ($(echo "$git_today" | wc -l | tr -d ' ' ) 个):**\n$(echo "$git_today" | sed 's/^/  /')"
    fi
    
    # 今日新增文件
    local new_files=$(git -C "$WORKSPACE" diff --name-only --diff-filter=A --since="${TODAY} 00:00" 2>/dev/null || echo "")
    [ -n "$new_files" ] && changes="$changes\n\n**新增文件:**\n$(echo "$new_files" | sed 's/^/  - /')"
    
    # 今日修改文件
    local mod_files=$(git -C "$WORKSPACE" diff --name-only --diff-filter=M --since="${TODAY} 00:00" 2>/dev/null || echo "")
    [ -n "$mod_files" ] && changes="$changes\n\n**修改文件:**\n$(echo "$mod_files" | sed 's/^/  - /')"
    
    # 今日删除文件
    local del_files=$(git -C "$WORKSPACE" diff --name-only --diff-filter=D --since="${TODAY} 00:00" 2>/dev/null || echo "")
    [ -n "$del_files" ] && changes="$changes\n\n**删除文件:**\n$(echo "$del_files" | sed 's/^/  - /')"
    
    [ -z "$changes" ] && changes="\n  无变更"
    echo -e "$changes"
}

# ----------------------------------------------------------
# 分析项目结构
# ----------------------------------------------------------
analyze_structure() {
    log "${BLUE}[分析] 项目结构...${NC}"
    
    local structure=""
    
    # 顶级目录
    structure="$structure\n\n**目录结构:**"
    for dir in "$WORKSPACE"/*/; do
        [ -d "$dir" ] || continue
        local name=$(basename "$dir")
        # 跳过 node_modules 和 .git
        [[ "$name" =~ ^(node_modules|\.git|dist)$ ]] && continue
        local count=$(find "$dir" -type f \( -name "*.jsx" -o -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.md" \) 2>/dev/null | wc -l | tr -d ' ')
        structure="$structure\n  - $name/ ($count 文件)"
    done
    
    echo -e "$structure"
}

# ----------------------------------------------------------
# 读取活跃定时任务
# ----------------------------------------------------------
read_cron_tasks() {
    log "${BLUE}[分析] 定时任务...${NC}"
    
    local crons=""
    
    # 读取 HEARTBEAT.md
    if [ -f "$WORKSPACE/HEARTBEAT.md" ]; then
        local heartbeat_content=$(cat "$WORKSPACE/HEARTBEAT.md")
        if [ -n "$heartbeat_content" ] && [ ! "$heartbeat_content" = "# HEARTBEAT.md" ]; then
            crons="$crons\n\n**HEARTBEAT 任务:**\n$(echo "$heartbeat_content" | sed 's/^/  /')"
        fi
    fi
    
    # 检查 automations 脚本
    for script in "$SCRIPT_DIR"/*.sh 2>/dev/null; do
        [ -f "$script" ] || continue
        local name=$(basename "$script" .sh)
        local shebang=$(head -1 "$script")
        local cron=$(grep -E "^#定时|^#cron|^# schedule" "$script" 2>/dev/null | head -1)
        crons="$crons\n  - $name: $cron"
    done
    
    [ -z "$crons" ] && crons="\n  无活跃定时任务"
    echo -e "$crons"
}

# ----------------------------------------------------------
# 读取已知问题
# ----------------------------------------------------------
read_known_issues() {
    log "${BLUE}[分析] 已知问题...${NC}"
    
    local issues=""
    
    # 从 memory/ 中汇总
    for memofile in "$MEMORY_DIR"/*.md; do
        [ -f "$memofile" ] || continue
        local issue_lines=$(grep -E "异常|错误|问题|失败" "$memofile" 2>/dev/null | grep -v "^#" | head -5)
        [ -n "$issue_lines" ] && issues="$issues\n\n---\n$(basename $memofile):\n$(echo "$issue_lines" | sed 's/^/  /')"
    done
    
    [ -z "$issues" ] && issues="\n  无已知问题"
    echo -e "$issues"
}

# ----------------------------------------------------------
# 生成文档
# ----------------------------------------------------------
generate_docs() {
    log "${BLUE}[生成] 文档更新...${NC}"
    
    local changes=$(collect_today_changes)
    local structure=$(analyze_structure)
    local crons=$(read_cron_tasks)
    local issues=$(read_known_issues)
    
    local UPDATE_TIME=$(date "+%Y-%m-%d %H:%M:%S")
    
    cat > "$TMP_FILE" << EOF
# 系统参考文档

> 自动生成的系统文档。每晚23:00自动更新。  
> 上次更新: ${UPDATE_TIME}

---

## 📝 今日变更 (${TODAY})

$changes

---

## 🏗 架构概览

**项目:** OpenOrigin - AI Agent Command Center  
**技术栈:** React + Vite + Tailwind CSS + Framer Motion + Lucide Icons + Recharts  
**工作空间:** ${WORKSPACE}

### 目录结构

$(analyze_structure)

---

## 📦 模块清单

| 模块 | 路径 | 说明 |
|------|------|------|
| Dashboard | src/modules/Dashboard/ | 指挥甲板 - 系统概览 |
| Agents | src/modules/Agents/ | 特工档案 - Agent管理 |
| TaskBoard | src/modules/TaskBoard/ | 任务看板 - 看板式任务管理 |
| Logs | src/modules/Logs/ | AI日志 - 实时日志查看 |
| Parliament | src/modules/Parliament/ | 多Agent讨论界面 |
| Meetings | src/modules/Meetings/ | 会议情报 - 会议记录与分析 |
| Ops | src/modules/Ops/ | 任务管理 - 任务创建/筛选 |
| Brain | src/modules/Brain/ | 每日简报生成 |
| Lab | src/modules/Lab/ | 实验仪表盘 |

---

## ⏰ 活跃定时任务

$crons

---

## 🔧 自动化脚本

| 脚本 | 功能 |
|------|------|
| backup-repo.sh | 私有仓库备份 |
| self-optimize.sh | 夜间自我优化 |
| daily-briefing.sh | 每日简报生成 |
| update-docs.sh | 滚动式文档更新 |

---

## 🐛 已知问题

$issues

---

## 📊 系统状态

EOF

    # 动态系统状态
    local commit_today=$(git -C "$WORKSPACE" log --since="${TODAY} 00:00" --oneline 2>/dev/null | wc -l | tr -d ' ' || echo "0")
    local backup_status=$(cat "$SCRIPT_DIR/../backups/.last-backup" 2>/dev/null | grep "status=" | cut -d= -f2 || echo "unknown")
    local last_backup=$(cat "$SCRIPT_DIR/../backups/.last-backup" 2>/dev/null | grep "last_backup=" | cut -d= -f2- || echo "unknown")
    
    cat >> "$TMP_FILE" << EOF
- 今日提交: $commit_today
- 备份状态: $backup_status
- 最后备份: $last_backup

---

## 🔄 回滚指南

如需撤销自动化产生的错误修改：

### 1. Git 回滚
\`\`\`bash
# 查看变更
git log --oneline -10

# 撤销特定提交
git revert <commit-hash>

# 强制回退到某个版本
git reset --hard <commit-hash>
git push --force
\`\`\`

### 2. 文件恢复
\`\`\`bash
# 恢复特定文件
git checkout <commit-hash> -- path/to/file

# 从备份恢复 docs/SYSTEM-REFERENCE.md
cp docs/SYSTEM-REFERENCE.md docs/SYSTEM-REFERENCE.md.bak
\`\`\`

### 3. 文档恢复
\`\`\`bash
# 查看文档历史
git log --follow docs/SYSTEM-REFERENCE.md

# 恢复文档到上一个版本
git show HEAD~1:docs/SYSTEM-REFERENCE.md > docs/SYSTEM-REFERENCE.md
\`\`\`

---

*此文档由 update-docs.sh 自动生成。请勿手动编辑，会被覆盖。*
EOF

    # 原子替换
    mv "$TMP_FILE" "$DOCS_FILE"
    
    log "${GREEN}[完成] 文档已更新: $DOCS_FILE${NC}"
}

# ----------------------------------------------------------
# 主流程
# ----------------------------------------------------------
main() {
    echo "" >> "$LOG_FILE"
    log "${BLUE}=== 文档更新开始 ===${NC}"
    
    mkdir -p "$WORKSPACE/docs" "$MEMORY_DIR"
    
    START_TIME=$(date +%s)
    generate_docs
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    log "${GREEN}=== 完成，耗时 ${DURATION}s ===${NC}"
}

main "$@"
