#!/bin/bash
# ============================================================
# 自动化任务 4：滚动式系统文档
# 功能：分析系统变更，更新 SYSTEM-REFERENCE.md
# 输出：docs/SYSTEM-REFERENCE.md（实时系统工作原理参考）
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="/root/.openclaw/workspace"
DOCS_DIR="$WORKSPACE/docs"
SYSTEM_DOC="$DOCS_DIR/SYSTEM-REFERENCE.md"
MEMORY_DIR="$WORKSPACE/memory"
TODAY=$(date +%Y-%m-%d)
LAST_UPDATE_FILE="$SCRIPT_DIR/.last-doc-update"

mkdir -p "$DOCS_DIR" "$MEMORY_DIR"

get_git_changes() {
    cd "$WORKSPACE"
    if [[ ! -d .git ]]; then
        echo "非 Git 仓库，跳过变更分析"
        return
    fi
    
    local last_date
    last_date=$(cat "$LAST_UPDATE_FILE" 2>/dev/null || echo "1970-01-01")
    
    echo "### 📂 Git 变更（自 $last_date）"
    echo ""
    
    local changes
    changes=$(git log --since="$last_date" --oneline --name-status 2>/dev/null || echo "")
    
    if [[ -n "$changes" ]]; then
        echo "$changes" | head -50
    else
        echo "_无变更_"
    fi
    echo ""
}

get_architecture() {
    echo "### 🏗️ 当前架构"
    echo ""
    cat << 'ARCHEOF'
```
OpenClaw Workspace
├── agents/          # AI Agent 配置
├── docs/            # 系统文档
├── memory/          # 每日记忆
├── projects/        # 项目目录
│   └── openzeno/    # OpenZeno 仪表板
├── skills/          # 技能模块
├── scripts/         # 自动化脚本
│   └── cron/        # 定时任务
├── SOUL.md          # 身份宪章
├── USER.md          # 用户档案
├── AGENTS.md        # 运营手册
├── TOOLS.md         # 工具配置
└── MEMORY.md        # 长期记忆
```
ARCHEOF
    echo ""
}

get_modules() {
    echo "### 📦 模块清单"
    echo ""
    
    # 核心配置
    echo "**核心配置：**"
    ls -1 "$WORKSPACE"/*.md 2>/dev/null | while read -r f; do
        local size
        size=$(wc -l < "$f")
        echo "- $(basename "$f") ($size 行)"
    done
    echo ""
    
    # 项目
    echo "**项目：**"
    if [[ -d "$WORKSPACE/projects" ]]; then
        ls -1d "$WORKSPACE/projects"/*/ 2>/dev/null | while read -r d; do
            local name
            name=$(basename "$d")
            local has_package
            has_package=$([[ -f "$d/package.json" ]] && echo " (Node.js)" || echo "")
            echo "- $name$has_package"
        done
    fi
    echo ""
    
    # 自动化脚本
    echo "**自动化脚本：**"
    if [[ -d "$WORKSPACE/scripts/cron" ]]; then
        ls -1 "$WORKSPACE/scripts/cron/" 2>/dev/null | while read -r d; do
            echo "- $d/"
        done
    fi
    echo ""
}

get_cron_tasks() {
    echo "### ⏰ 活跃定时任务"
    echo ""
    
    # 读取 crontab
    echo "```bash"
    crontab -l 2>/dev/null || echo "# 无定时任务"
    echo "```"
    echo ""
}

get_active_processes() {
    echo "### 🔄 活跃进程"
    echo ""
    
    echo "| 进程 | PID | 端口 | 状态 |"
    echo "|------|-----|------|------|"
    
    # 检查 OpenZeno
    if pgrep -f "openzeno" > /dev/null 2>&1; then
        local pid
        pid=$(pgrep -f "openzeno" | head -1)
        echo "| OpenZeno (Dev) | $pid | 8800 | ✅ 运行中 |"
    fi
    
    # 检查 Nginx
    if pgrep -f "nginx" > /dev/null 2>&1; then
        echo "| Nginx | $(pgrep -f nginx | head -1) | 80/443 | ✅ 运行中 |"
    fi
    echo ""
}

get_recent_files() {
    echo "### 🆕 近期文件（7天内）"
    echo ""
    echo "| 文件 | 修改时间 |"
    echo "|------|----------|"
    find "$WORKSPACE" -maxdepth 2 -type f -mtime -7 ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | while read -r f; do
        local mtime
        mtime=$(stat -c %y "$f" 2>/dev/null | cut -d' ' -f1 || stat -f %Sm -t %Y-%m-%d "$f" 2>/dev/null || echo "unknown")
        echo "| $(echo "$f" | sed "s|$WORKSPACE/||") | $mtime |"
    done | sort -t'|' -k3 -r | head -15
    echo ""
}

get_api_routes() {
    echo "### 🌐 API 路由 / 连接配置"
    echo ""
    
    # 检查 OpenZeno 路由
    if [[ -f "$WORKSPACE/projects/openzeno/src/App.tsx" ]]; then
        echo "**OpenZeno 前端路由：**"
        grep -oP "path=['\"]/?[a-zA-Z/-]+['\"]" "$WORKSPACE/projects/openzeno/src/App.tsx" 2>/dev/null | sort -u | while read -r r; do
            echo "- $r"
        done
        echo ""
    fi
    
    # 检查代理配置
    echo "**Nginx 配置：**"
    if [[ -f "/etc/nginx/sites-enabled/oz.120619.xyz" ]]; then
        grep -E "listen|server_name|proxy_pass" /etc/nginx/sites-enabled/oz.120619.xyz 2>/dev/null | head -10
    fi
    echo ""
}

get_known_issues() {
    echo "### ⚠️ 已知问题"
    echo ""
    
    # 检查 memory/ 中的异常记录
    find "$MEMORY_DIR" -name "*.md" -mtime -7 2>/dev/null | while read -r f; do
        grep -i "异常\|错误\|失败\|issue\|bug" "$f" 2>/dev/null | head -3 | while read -r line; do
            echo "- [$(basename "$f")] $line"
        done
    done
    
    # 检查日志
    if [[ -d "$WORKSPACE/scripts/logs" ]]; then
        find "$WORKSPACE/scripts/logs" -name "*.log" -mtime -1 2>/dev/null | while read -r l; do
            grep -i "error\|fail\|exception" "$l" 2>/dev/null | head -3 | while read -r line; do
                echo "- [LOG] $line"
            done
        done
    fi
    
    echo "_无已知问题_"
    echo ""
}

get_today_log() {
    local today_log="$MEMORY_DIR/$TODAY.md"
    if [[ -f "$today_log" ]]; then
        echo "### 📝 今日动态"
        echo ""
        grep -A 30 "## 任务记录\|## 今日任务" "$today_log" 2>/dev/null | head -20
        echo ""
    fi
}

update_last_update() {
    echo "$TODAY" > "$LAST_UPDATE_FILE"
}

main() {
    echo "========== 更新系统文档 =========="
    
    # 确保初始文件存在
    if [[ ! -f "$LAST_UPDATE_FILE" ]]; then
        update_last_update
    fi
    
    {
        echo "# 🔧 SYSTEM-REFERENCE.md"
        echo ""
        echo "> _最后更新：$(date '+%Y-%m-%d %H:%M:%S')_"
        echo ""
        echo "---"
        echo ""
        
        get_architecture
        get_modules
        get_api_routes
        get_cron_tasks
        get_active_processes
        get_recent_files
        get_git_changes
        get_today_log
        get_known_issues
        
        echo "---"
        echo "_由 OpenClaw 自动化维护_"
    } > "$SYSTEM_DOC"
    
    update_last_update
    
    echo "========== 文档已更新 =========="
    echo "文件位置: $SYSTEM_DOC"
}

main "$@"
