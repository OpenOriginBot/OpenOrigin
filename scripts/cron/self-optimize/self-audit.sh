#!/bin/bash
# ============================================================
# 自动化任务 2：夜间自我优化
# 功能：审计文档整洁度、失效链接、过期文件、低效提示词
# 安全策略：只提出建议 / 应用低风险修复，记录所有变更
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="/root/.openclaw/workspace"
MEMORY_DIR="$WORKSPACE/memory"
LOG_FILE="$MEMORY_DIR/$(date +%Y-%m-%d)-audit.md"
TODAY=$(date +%Y-%m-%d)

mkdir -p "$MEMORY_DIR"

declare -a IMPROVEMENTS=()
declare -a APPLIED=()
declare -a WARNINGS=()

log_improvement() {
    IMPROVEMENTS+=("### 💡 改进建议")
    IMPROVEMENTS+=("$1")
    IMPROVEMENTS+=("")
}

log_applied() {
    APPLIED+=("- $(date '+%H:%M') $1")
}

log_warning() {
    WARNINGS+=("- ⚠️ $1")
}

# 1. 检查文档不一致
audit_docs() {
    echo "🔍 审计文档一致性..."
    
    # 检查核心文档是否存在
    local required_docs=("SOUL.md" "USER.md" "AGENTS.md" "TOOLS.md" "MEMORY.md")
    local missing_docs=()
    
    for doc in "${required_docs[@]}"; do
        if [[ ! -f "$WORKSPACE/$doc" ]]; then
            missing_docs+=("$doc")
            log_warning "$doc 缺失"
        fi
    done
    
    if [[ ${#missing_docs[@]} -gt 0 ]]; then
        log_improvement "缺少核心文档: ${missing_docs[*]}，建议立即创建"
    fi
    
    # 检查 [待填充] 占位符
    local placeholders
    placeholders=$(grep -r "\[待填充\]" "$WORKSPACE" --include="*.md" 2>/dev/null | wc -l || echo 0)
    if [[ "$placeholders" -gt 10 ]]; then
        log_improvement "存在 $placeholders 处 [待填充] 占位符，建议完成配置"
    elif [[ "$placeholders" -gt 0 ]]; then
        log_applied "发现 $placeholders 处 [待填充]，将在下个会话提醒"
    fi
    
    # 检查空 HEARTBEAT.md
    if [[ -f "$WORKSPACE/HEARTBEAT.md" ]]; then
        local hb_size
        hb_size=$(stat -f%z "$WORKSPACE/HEARTBEAT.md" 2>/dev/null || stat -c%s "$WORKSPACE/HEARTBEAT.md" 2>/dev/null || echo 0)
        if [[ "$hb_size" -lt 50 ]]; then
            log_improvement "HEARTBEAT.md 几乎为空，考虑添加周期性任务检查项"
        fi
    fi
}

# 2. 检查待办清单整洁度
audit_todos() {
    echo "🔍 审计待办清单..."
    
    # 检查 memory/ 中的待办标记
    local todo_files
    todo_files=$(grep -l "\- \[ \]" "$MEMORY_DIR"/*.md 2>/dev/null | wc -l || echo 0)
    
    if [[ "$todo_files" -gt 5 ]]; then
        log_improvement "有 $todo_files 个文件存在未完成待办，建议清理或完成"
    fi
    
    # 检查过期待办（超过7天未处理的）
    find "$MEMORY_DIR" -name "*.md" -mtime +7 -exec grep -l "\- \[ \]" {} \; 2>/dev/null | while read -r f; do
        log_improvement "待办清单过期: $(basename "$f")"
    done
}

# 3. 检查失效链接（仅检查内部链接）
audit_links() {
    echo "🔍 审计内部链接..."
    
    # 检查文档中引用本地文件是否存在
    grep -rho "\.\./[a-zA-Z0-9/_-]*\.md" "$WORKSPACE" --include="*.md" 2>/dev/null | sort -u | while read -r link; do
        local target="$WORKSPACE/$link"
        if [[ ! -f "$target" && ! -d "$target" ]]; then
            log_warning "引用失效: $link"
        fi
    done
    
    # 检查 docs/ 目录中的链接
    if [[ -d "$WORKSPACE/docs" ]]; then
        grep -rho "\[.*\](.*\.md)" "$WORKSPACE/docs/" 2>/dev/null | sed 's/.*\](\([^)]*\)).*/\1/' | while read -r link; do
            if [[ "$link" != http* && "$link" != /* ]]; then
                local target="$WORKSPACE/docs/$link"
                if [[ ! -f "$target" ]]; then
                    log_warning "docs/ 中的链接失效: $link"
                fi
            fi
        done
    fi
}

# 4. 检查过期文件
audit_stale() {
    echo "🔍 审计过期文件..."
    
    # 检查超过30天未修改的核心配置文件
    local stale_threshold=30
    find "$WORKSPACE" -maxdepth 1 -name "*.md" -mtime +"$stale_threshold" ! -name "MEMORY.md" 2>/dev/null | while read -r f; do
        local age
        age=$(find "$f" -mtime +"$stale_threshold" 2>/dev/null)
        if [[ -n "$age" ]]; then
            log_improvement "文件长期未更新: $(basename "$f")"
        fi
    done
    
    # 检查 memory/ 中是否有超过60天的日志
    find "$MEMORY_DIR" -name "*.md" -mtime +60 2>/dev/null | while read -r f; do
        log_improvement "旧日志文件可归档: $(basename "$f")"
    done
}

# 5. 检查低效提示词
audit_prompts() {
    echo "🔍 审计提示词效率..."
    
    # 检查是否有重复的初始化提示
    local init_count
    init_count=$(grep -r "BOOTSTRAP\|首次\|第一次" "$WORKSPACE" --include="*.md" 2>/dev/null | wc -l || echo 0)
    if [[ "$init_count" -gt 3 ]]; then
        log_improvement "初始化相关提示出现 $init_count 次，考虑整合"
    fi
    
    # 检查 SOUL.md 中的底线是否清晰
    if [[ -f "$WORKSPACE/SOUL.md" ]]; then
        if ! grep -q "❌\|红线\|底线\|禁止" "$WORKSPACE/SOUL.md"; then
            log_improvement "SOUL.md 缺少明确的红线定义，建议添加"
        fi
    fi
}

# 应用低风险修复（需要确认安全的操作）
apply_safe_fixes() {
    echo "🔧 应用低风险修复..."
    
    # 清理空的日志文件
    find "$MEMORY_DIR" -name "*.md" -size 0 2>/dev/null | while read -r f; do
        rm "$f" 2>/dev/null && log_applied "删除空文件: $(basename "$f")"
    done
    
    # 清理临时文件
    find "$WORKSPACE" -name "*.tmp" -mtime +1 2>/dev/null | while read -r f; do
        rm "$f" 2>/dev/null && log_applied "删除临时文件: $(basename "$f")"
    done
    
    # 修复 Windows 换行符
    find "$WORKSPACE" -name "*.md" -exec file {} \; 2>/dev/null | grep "CRLF" | cut -d: -f1 | while read -r f; do
        sed -i 's/\r$//' "$f" 2>/dev/null && log_applied "修复换行符: $(basename "$f")"
    done
}

# 生成报告
generate_report() {
    {
        echo "# 🌙 夜间自我优化报告"
        echo ""
        echo "**日期：** $TODAY"
        echo "**时间：** $(date '+%H:%M:%S')"
        echo ""
        
        echo "## ✅ 已应用修复"
        echo ""
        if [[ ${#APPLIED[@]} -eq 0 ]]; then
            echo "_无_"
        else
            printf '%s\n' "${APPLIED[@]}"
        fi
        echo ""
        
        echo "## 📊 审计结果"
        echo ""
        if [[ ${#WARNINGS[@]} -eq 0 ]]; then
            echo "_无警告_"
        else
            printf '%s\n' "${WARNINGS[@]}"
        fi
        echo ""
        
        echo "## 💡 改进建议"
        echo ""
        if [[ ${#IMPROVEMENTS[@]} -eq 0 ]]; then
            echo "_无建议_"
        else
            printf '%s\n' "${IMPROVEMENTS[@]}"
        fi
        echo ""
        
        echo "---"
        echo "_由 OpenClaw 自动化生成_"
    } >> "$LOG_FILE"
}

main() {
    echo "========== 开始夜间自我优化 =========="
    echo "日期：$TODAY"
    
    audit_docs
    audit_todos
    audit_links
    audit_stale
    audit_prompts
    
    apply_safe_fixes
    
    generate_report
    
    echo "========== 优化完成 =========="
    echo "报告已保存至: $LOG_FILE"
}

main "$@"
