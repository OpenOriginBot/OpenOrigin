#!/bin/bash
# ============================================================
# 自动化 2：夜间自我优化
# 功能：审计 + 低风险修复 + 记录到 memory/
# 定时：每天 02:00 自动运行
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="/Users/liam/.openclaw/workspace"
LOG_FILE="$SCRIPT_DIR/../logs/optimize-$(date +%Y%m%d).log"
MEMORY_DIR="$WORKSPACE/memory"
TODAY=$(date +%Y-%m-%d)
MEMORY_FILE="$MEMORY_DIR/${TODAY}.md"

# 安全模式：只修复这些扩展名的文件
SAFE_EXTENSIONS="\.md\|\.txt\|\.json\|\.yml\|\.yaml\|\.sh"
# 低风险修复：文件末尾空白、重复空行、简单的格式问题
SAFE_FIXES=("trailing_whitespace" "duplicate_blank_lines" "json_format" "heading_spacing")

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
# 审计报告结构
# ----------------------------------------------------------
declare -a AUDIT_ISSUES
declare -a AUDIT_FIXES
AUDIT_SCORE=100

add_issue() {
    AUDIT_ISSUES+=("$1")
    AUDIT_SCORE=$((AUDIT_SCORE - $2))
}

add_fix() {
    AUDIT_FIXES+=("$1")
}

# ----------------------------------------------------------
# 审计 1：文档偏差检测
# ----------------------------------------------------------
audit_docs() {
    log "${BLUE}[审计] 文档偏差检测...${NC}"
    
    # 检查文档中引用的文件路径是否还存在
    local doc_files=("$WORKSPACE/docs/"*.md "$WORKSPACE"/**/*.md 2>/dev/null)
    local broken_links=0
    
    # 检测 docs/ 下的文件中是否有引用失效的相对路径
    for doc in "$WORKSPACE/docs/"*.md 2>/dev/null; do
        [ -f "$doc" ] || continue
        # 检查 ![](path) 或 [text](path) 引用
        while IFS= read -r line; do
            local ref=$(echo "$line" | grep -oE '\[.*?\]\([^)]+\)' | head -1 | sed 's/.*](\([^)]*\)).*/\1/')
            [ -n "$ref" ] && [ ! "${ref:0:1}" = "#" ] && [ ! "${ref:0:4}" = "http" ] && \
                [ ! -e "$WORKSPACE/$ref" ] && [ ! -e "$(dirname $doc)/$ref" ] && \
                add_issue "失效链接: $ref in $(basename $doc)" 5
        done < "$doc"
    done
    
    # 检测 TODO/FIXME 是否超期（超过30天未处理）
    for todo in $(grep -r "TODO\|FIXME" "$WORKSPACE" --include="*.md" -l 2>/dev/null | head -5); do
        local todo_count=$(grep -c "TODO\|FIXME" "$todo" || echo 0)
        [ "$todo_count" -gt 0 ] && add_issue "待处理TODO: $(basename $todo) 有 $todo_count 个" 3
    done
    
    log "${GREEN}  完成${NC}"
}

# ----------------------------------------------------------
# 审计 2：待办清单整洁度
# ----------------------------------------------------------
audit_todos() {
    log "${BLUE}[审计] 待办清单整洁度...${NC}"
    
    # 检查 memory/ 日记中的待办是否超期
    for memofile in "$MEMORY_DIR"/*.md 2>/dev/null; do
        [ -f "$memofile" ] || continue
        
        # 查找超期待办（[ ] 格式且包含日期）
        while IFS= read -r line; do
            echo "$line" | grep -qE "\[ \].*20[0-9]{2}-[0-9]{2}-[0-9]{2}" && \
                add_issue "逾期待办: $(basename $memofile) - $line" 5
        done < "$memofile"
        
        # 检查是否有过多未完成待办
        local open_todos=$(grep -c "\- \[ \]" "$memofile" 2>/dev/null || echo 0)
        [ "$open_todos" -gt 10 ] && add_issue "待办积压: $(basename $memofile) 有 $open_todos 个未完成" 2
    done
    
    log "${GREEN}  完成${NC}"
}

# ----------------------------------------------------------
# 审计 3：失效链接检测
# ----------------------------------------------------------
audit_links() {
    log "${BLUE}[审计] 失效链接检测...${NC}"
    
    # 检测 markdown 文件中的 http 链接是否有效（轻量检测，只抽检）
    local link_count=0
    local broken_count=0
    
    for doc in "$WORKSPACE"/**/*.md 2>/dev/null; do
        [ -f "$doc" ] || continue
        [ $link_count -gt 20 ] && break
        
        while IFS= read -r line; do
            local url=$(echo "$line" | grep -oE 'https?://[^ )]+' | head -1)
            [ -n "$url" ] && ! curl -s --max-time 3 "$url" &>/dev/null && \
                add_issue "失效URL: $url" 3 && ((broken_count++))
            ((link_count++))
        done < "$doc"
    done
    
    [ "$broken_count" -eq 0 ] && log "${GREEN}  无失效链接${NC}" || log "${YELLOW}  发现 $broken_count 个失效链接${NC}"
}

# ----------------------------------------------------------
# 审计 4：过期文件检测
# ----------------------------------------------------------
audit_files() {
    log "${BLUE}[审计] 过期文件检测...${NC}"
    
    local cutoff_date=$(date -v-30d +%Y-%m-%d 2>/dev/null || date -d "30 days ago" +%Y-%m-%d)
    
    # 检测 node_modules/.cache 等临时文件
    [ -d "$WORKSPACE/node_modules/.cache" ] && \
        add_issue "临时缓存: node_modules/.cache 存在，可清理" 1
    
    # 检测长期未修改的日志文件
    for logfile in "$WORKSPACE"/**/*.log 2>/dev/null; do
        [ -f "$logfile" ] || continue
        local mod_date=$(stat -f "%Sm" -t "%Y-%m-%d" "$logfile" 2>/dev/null || \
                         stat -c "%y" "$logfile" 2>/dev/null | cut -d' ' -f1)
        [ "$mod_date" \< "$cutoff_date" ] && add_issue "过期日志: $logfile (最后修改: $mod_date)" 1
    done
    
    # 检测空的或只有标题的 md 文件
    for mdfile in "$WORKSPACE"/**/*.md 2>/dev/null; do
        [ -f "$mdfile" ] || continue
        local lines=$(wc -l < "$mdfile")
        [ "$lines" -le 1 ] && add_issue "空文档: $mdfile" 1
    done
    
    log "${GREEN}  完成${NC}"
}

# ----------------------------------------------------------
# 审计 5：低效提示词检测
# ----------------------------------------------------------
audit_prompts() {
    log "${BLUE}[审计] 提示词效率检测...${NC}"
    
    # 检测 SOUL.md, AGENTS.md 等文件中的提示词长度
    for prompt_file in "$WORKSPACE/SOUL.md" "$WORKSPACE/AGENTS.md" "$WORKSPACE/USER.md" 2>/dev/null; do
        [ -f "$prompt_file" ] || continue
        local lines=$(wc -l < "$prompt_file")
        local chars=$(wc -c < "$prompt_file")
        
        # 超过500行的提示词可能需要精简
        [ "$lines" -gt 500 ] && add_issue "冗长提示: $(basename $prompt_file) ($lines 行, ${chars}字符)，考虑拆分" 2
        
        # 检测重复的指令模式
        local dups=$(grep -c "永远不" "$prompt_file" 2>/dev/null || echo 0)
        [ "$dups" -gt 5 ] && add_issue "重复约束: $(basename $prompt_file) 有 $dups 个'永远不'声明" 1
    done
    
    log "${GREEN}  完成${NC}"
}

# ----------------------------------------------------------
# 执行低风险修复
# ----------------------------------------------------------
apply_safe_fixes() {
    log "${BLUE}[修复] 应用低风险修复...${NC}"
    
    local fixes_applied=0
    
    # 修复1：去除文件末尾空白（仅限 md/txt/sh）
    for file in $(find "$WORKSPACE" -type f \( -name "*.md" -o -name "*.txt" -o -name "*.sh" \) 2>/dev/null | head -20); do
        if grep -q " $" "$file" 2>/dev/null; then
            sed -i '' 's/[[:space:]]*$//' "$file" 2>/dev/null || true
            add_fix "去除末尾空白: $(basename $file)"
            ((fixes_applied++))
        fi
    done
    
    # 修复2：清理重复空行
    for file in $(find "$WORKSPACE/docs" -type f -name "*.md" 2>/dev/null | head -10); do
        if grep -qP "\n\n\n" "$file" 2>/dev/null; then
            sed -i '' '/^$/N;/^\n$/D' "$file" 2>/dev/null || true
            add_fix "清理重复空行: $(basename $file)"
            ((fixes_applied++))
        fi
    done
    
    [ "$fixes_applied" -eq 0 ] && log "${GREEN}  无需修复${NC}" || log "${GREEN}  已执行 $fixes_applied 项修复${NC}"
}

# ----------------------------------------------------------
# 生成优化报告 → memory/
# ----------------------------------------------------------
generate_report() {
    log "${BLUE}[报告] 生成优化报告...${NC}"
    
    # 确保 memory/ 目录存在
    mkdir -p "$MEMORY_DIR"
    
    # 追加到今日 memory 文件
    {
        echo ""
        echo "## $TODAY 夜间优化审计"
        echo ""
        echo "### 审计得分"
        echo "得分: ${AUDIT_SCORE}/100 $([ $AUDIT_SCORE -ge 80 ] && echo '✅ 良好' || echo '⚠️ 需关注')"
        echo ""
        echo "### 发现的问题"
        if [ ${#AUDIT_ISSUES[@]} -eq 0 ]; then
            echo "- 无问题发现"
        else
            for issue in "${AUDIT_ISSUES[@]}"; do
                echo "- $issue"
            done
        fi
        echo ""
        echo "### 已执行的修复"
        if [ ${#AUDIT_FIXES[@]} -eq 0 ]; then
            echo "- 无"
        else
            for fix in "${AUDIT_FIXES[@]}"; do
                echo "- $fix"
            done
        fi
        echo ""
        echo "### 建议人工处理"
        echo "- 审查 above score < 80: 需要人工介入"
        echo "- 失效链接: 确认后更新或移除"
        echo "- 逾期待办: 完成或删除"
        echo ""
    } >> "$MEMORY_FILE"
    
    log "${GREEN}  报告已保存: $MEMORY_FILE${NC}"
}

# ----------------------------------------------------------
# 主流程
# ----------------------------------------------------------
main() {
    echo "" >> "$LOG_FILE"
    log "${BLUE}=== 夜间自我优化开始 ===${NC}"
    
    START_TIME=$(date +%s)
    
    audit_docs
    audit_todos
    audit_links
    audit_files
    audit_prompts
    apply_safe_fixes
    generate_report
    
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    
    log "${GREEN}=== 优化完成，耗时 ${DURATION}s，得分 ${AUDIT_SCORE}/100 ===${NC}"
}

main "$@"
