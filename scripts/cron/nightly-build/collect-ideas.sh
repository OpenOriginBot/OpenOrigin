#!/bin/bash
# ============================================================
# 夜间构建任务：收集创意想法
# 功能：从 memory/ 中分析夜间活动，生成新的创意想法
# 输出：写入 OpenZeno 的 ideas.json
# 运行时间：每日 06:00（在简报之前）
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="/root/.openclaw/workspace"
MEMORY_DIR="$WORKSPACE/memory"
IDEAS_FILE="$WORKSPACE/projects/openzeno/src/data/ideas.json"
LOG_DIR="$SCRIPT_DIR/../logs"
LOG_FILE="$LOG_DIR/collect-ideas-$(date +%Y%m%d).log"

mkdir -p "$LOG_DIR" "$WORKSPACE/projects/openzeno/src/data"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Generate a unique ID
generate_id() {
    echo "idea-$(date +%Y%m%d%H%M%S)-$((RANDOM % 1000))"
}

# Analyze memory files for potential ideas
analyze_memory_for_ideas() {
    local ideas=()
    local today=$(date +%Y-%m-%d)
    local yesterday=$(date -d "yesterday" +%Y-%m-%d 2>/dev/null || date -v-1d +%Y-%m-%d 2>/dev/null)
    
    # Check today's memory file for any new insights
    if [[ -f "$MEMORY_DIR/$today.md" ]]; then
        local content=$(cat "$MEMORY_DIR/$today.md")
        
        # Look for TODO items that could become ideas
        local todos=$(echo "$content" | grep -E "^\s*-\s*\[\s*\]" | head -3)
        if [[ -n "$todos" ]]; then
            while IFS= read -r todo; do
                local todo_text=$(echo "$todo" | sed 's/^\s*-\s*\[\s*\]\s*//')
                if [[ ${#todo_text} -gt 10 ]]; then
                    ideas+=("从 TODO 发现: $todo_text")
                fi
            done <<< "$todos"
        fi
    fi
    
    # Check MEMORY.md for high-priority items
    if [[ -f "$WORKSPACE/MEMORY.md" ]]; then
        local priority_section=$(grep -A 20 "## 📌 当前项目状态" "$WORKSPACE/MEMORY.md" 2>/dev/null || true)
        if [[ -n "$priority_section" ]]; then
            # Look for mentions of problems or improvements needed
            local problems=$(echo "$priority_section" | grep -E "(痛点|问题|待解决|改进)" | head -2)
            if [[ -n "$problems" ]]; then
                while IFS= read -r problem; do
                    local problem_text=$(echo "$problem" | sed 's/^\s*[-*]\s*//')
                    if [[ ${#problem_text} -gt 5 ]]; then
                        ideas+=("从 MEMORY 发现需求: $problem_text")
                    fi
                done <<< "$problems"
            fi
        fi
    fi
    
    # Check recent memory files for patterns
    for f in "$MEMORY_DIR"/*.md; do
        if [[ -f "$f" && "$f" != "$MEMORY_DIR/$today.md" ]]; then
            local basename=$(basename "$f")
            # Look for any "idea" or "创意" mentions
            local mentions=$(grep -h -i "创意\|idea\|想法\|灵感" "$f" 2>/dev/null | head -2)
            if [[ -n "$mentions" ]]; then
                while IFS= read -r mention; do
                    local mention_text=$(echo "$mention" | sed 's/^#.*$//' | sed 's/[*_`#]/ /g' | xargs)
                    if [[ ${#mention_text} -gt 10 ]]; then
                        ideas+=("从 $basename 提取: $mention_text")
                    fi
                done <<< "$mentions"
            fi
        fi
    done
    
    # Return unique ideas
    echo "${ideas[@]}" | tr ' ' '\n' | sort -u | head -5
}

# Parse existing ideas
parse_existing_ideas() {
    if [[ -f "$IDEAS_FILE" ]]; then
        cat "$IDEAS_FILE"
    else
        echo '{"ideas":[]}'
    fi
}

# Check if an idea title already exists
idea_exists() {
    local title="$1"
    local ideas_data="$2"
    echo "$ideas_data" | grep -q "\"title\":\s*\"$title\"" && return 0
    return 1
}

# Calculate overall score from ratings
calculate_score() {
    local pain="$1"
    local dev="$2"
    local comm="$3"
    local ai="$4"
    local total=$(echo "scale=1; ($pain * 0.3 + $dev * 0.2 + $comm * 0.25 + $ai * 0.25)" | bc 2>/dev/null || echo "3.5")
    printf "%.1f" "$total"
}

# Main function
main() {
    log "========== 开始收集夜间创意 =========="
    
    # Read existing ideas
    local existing_data=$(parse_existing_ideas)
    local existing_count=$(echo "$existing_data" | grep -o '"id"' | wc -l)
    log "现有创意数量: $existing_count"
    
    # Analyze memory for new ideas
    local new_ideas=$(analyze_memory_for_ideas)
    local idea_count=0
    
    # If we found potential ideas, add them
    if [[ -n "$new_ideas" ]]; then
        log "发现潜在创意: $(echo "$new_ideas" | wc -l)"
        
        while IFS= read -r idea_text; do
            [[ -z "$idea_text" ]] && continue
            
            # Extract the meaningful part after the colon
            local title=$(echo "$idea_text" | sed 's/^[^:]*: //')
            [[ -z "$title" ]] && continue
            
            # Check if already exists
            if idea_exists "$title" "$existing_data"; then
                log "跳过重复创意: $title"
                continue
            fi
            
            # Generate new idea
            local id=$(generate_id)
            local today=$(date +%Y-%m-%dT%H:%M:%SZ)
            
            # Generate ratings (defaults based on content analysis)
            local pain_score=3
            local dev_score=3
            local comm_score=3
            local ai_score=3
            
            # Analyze content to adjust scores
            if echo "$title" | grep -qi "自动化\|auto"; then
                dev_score=$((dev_score + 1))
            fi
            if echo "$title" | grep -qi "客户\|买家\|用户"; then
                pain_score=$((pain_score + 1))
                comm_score=$((comm_score + 1))
            fi
            if echo "$title" | grep -qi "AI\|智能"; then
                ai_score=$((ai_score + 1))
            fi
            
            # Cap scores at 5
            pain_score=$((pain_score > 5 ? 5 : pain_score))
            dev_score=$((dev_score > 5 ? 5 : dev_score))
            comm_score=$((comm_score > 5 ? 5 : comm_score))
            ai_score=$((ai_score > 5 ? 5 : ai_score))
            
            local overall=$(calculate_score "$pain_score" "$dev_score" "$comm_score" "$ai_score")
            
            # Determine category
            local category="运营工具"
            if echo "$title" | grep -qi "用户\|体验\|界面"; then
                category="用户体验"
            elif echo "$title" | grep -qi "AI\|智能\|自动化"; then
                category="AI应用"
            elif echo "$title" | grep -qi "数据\|分析"; then
                category="数据分析"
            elif echo "$title" | grep -qi "内容\|视频\|评价"; then
                category="内容创作"
            fi
            
            # Determine track
            local track="B"
            if (( $(echo "$overall >= 4.0" | bc -l 2>/dev/null || echo 0) )); then
                track="A"
            fi
            
            # Create new idea JSON
            local new_idea=$(cat <<EOF
{
  "id": "$id",
  "title": "$title",
  "summary": "从夜间自动化分析生成的创意：$title",
  "date": "$today",
  "track": "$track",
  "category": "$category",
  "ratings": {
    "painPoint": $pain_score,
    "devEfficiency": $dev_score,
    "commercialization": $comm_score,
    "aiAdvantage": $ai_score
  },
  "overallScore": $overall
}
EOF
)
            
            # Add to existing data
            existing_data=$(echo "$existing_data" | jq --argjson newidea "$new_idea" '.ideas = [$newidea] + .ideas')
            idea_count=$((idea_count + 1))
            log "添加创意: $title (评分: $overall)"
            
        done <<< "$new_ideas"
    else
        log "未发现新的创意想法"
    fi
    
    # Write updated ideas file
    if [[ $idea_count -gt 0 ]]; then
        echo "$existing_data" > "$IDEAS_FILE"
        log "已更新 ideas.json，新增 $idea_count 个创意"
    else
        log "无需更新 ideas.json"
    fi
    
    log "========== 创意收集完成 =========="
}

main "$@"