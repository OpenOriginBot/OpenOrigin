#!/bin/bash
# ============================================================
# 自动化任务回滚 / 恢复脚本
# 用法：bash scripts/cron/rollback.sh [action]
# ============================================================

set -euo pipefail

WORKSPACE="/root/.openclaw/workspace"
CRON_DIR="$WORKSPACE/scripts/cron"
LOG_DIR="$WORKSPACE/scripts/logs"

ACTION="${1:-help}"

case "$ACTION" in
    uninstall)
        echo "⚠️  确认要卸载所有定时任务吗？"
        echo "按 Ctrl+C 取消，或回车继续..."
        read -r
        crontab -r 2>/dev/null || true
        echo "✅ 定时任务已移除"
        ;;
    
    disable)
        echo "🔒 暂停定时任务（不删除配置）..."
        crontab -l > "$CRON_DIR/openzclaw-crontab.bak"
        crontab -r 2>/dev/null || true
        echo "✅ 定时任务已暂停（备份保留在 openzclaw-crontab.bak）"
        ;;
    
    enable)
        echo "🔓 恢复定时任务..."
        if [[ -f "$CRON_DIR/openzclaw-crontab.bak" ]]; then
            crontab "$CRON_DIR/openzclaw-crontab.bak"
            echo "✅ 已从备份恢复"
        elif [[ -f "$CRON_DIR/openzclaw-crontab" ]]; then
            crontab "$CRON_DIR/openzclaw-crontab"
            echo "✅ 已重新安装"
        else
            echo "❌ 未找到 crontab 文件"
            exit 1
        fi
        ;;
    
    restore-docs)
        echo "📄 恢复系统文档（从 Git 拉取最新版本）..."
        if [[ -d "$WORKSPACE/.git" ]]; then
            cd "$WORKSPACE"
            git checkout HEAD -- docs/SYSTEM-REFERENCE.md 2>/dev/null && echo "✅ 文档已恢复" || echo "❌ 恢复失败"
        else
            echo "❌ 非 Git 仓库，无法恢复"
            exit 1
        fi
        ;;
    
    restore-memory)
        echo "📄 恢复记忆文件..."
        if [[ -d "$WORKSPACE/.git" ]]; then
            cd "$WORKSPACE"
            git checkout HEAD -- memory/ 2>/dev/null && echo "✅ memory/ 已恢复" || echo "❌ 恢复失败"
        else
            echo "❌ 非 Git 仓库，无法恢复"
            exit 1
        fi
        ;;
    
    full-reset)
        echo "⚠️  完整重置所有自动化变更？"
        echo "将："
        echo "  1. 卸载定时任务"
        echo "  2. 从 Git 恢复 docs/ memory/ scripts/"
        echo "  3. 重新安装定时任务"
        echo ""
        echo "按 Ctrl+C 取消，或回车继续..."
        read -r
        
        crontab -r 2>/dev/null || true
        cd "$WORKSPACE"
        git checkout HEAD -- docs/ memory/ scripts/ 2>/dev/null || true
        crontab "$CRON_DIR/openzclaw-crontab"
        echo "✅ 完整重置完成"
        ;;
    
    log-cleanup)
        echo "🧹 清理旧日志（保留最近7天）..."
        find "$LOG_DIR" -name "*.log" -mtime +7 -delete 2>/dev/null
        echo "✅ 日志清理完成"
        ;;
    
    status)
        echo "============================================"
        echo "  自动化任务状态"
        echo "============================================"
        echo ""
        echo "⏰ Crontab 状态："
        crontab -l 2>/dev/null || echo "  无定时任务"
        echo ""
        echo "📝 最近日志："
        ls -lt "$LOG_DIR"/ 2>/dev/null | head -5
        echo ""
        echo "🔄 活跃进程："
        ps aux | grep -E "backup|self-audit|daily-briefing|update-docs" | grep -v grep || echo "  无"
        ;;
    
    help|*)
        echo "============================================"
        echo "  回滚 / 恢复脚本"
        echo "============================================"
        echo ""
        echo "用法：bash rollback.sh [action]"
        echo ""
        echo "可用操作："
        echo "  uninstall     卸载所有定时任务"
        echo "  disable       暂停定时任务（保留配置）"
        echo "  enable        恢复定时任务"
        echo "  restore-docs  恢复 docs/ 从 Git"
        echo "  restore-memory  恢复 memory/ 从 Git"
        echo "  full-reset    完整重置所有变更"
        echo "  log-cleanup   清理7天前日志"
        echo "  status        查看当前状态"
        echo "  help          显示本帮助"
        echo ""
        ;;
esac
