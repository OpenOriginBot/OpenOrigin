#!/bin/bash
# 自动化4：滚动式操作系统文档
# 分析当日变更 → 自动更新 docs/SYSTEM-REFERENCE.md

set -e

WORKSPACE="/Users/liam/.openclaw/workspace"
DOCS_DIR="$WORKSPACE/docs"
DATE=$(date +%Y-%m-%d)

echo "[文档] 开始滚动更新系统文档..."

# 获取今日变更文件（git）
cd "$WORKSPACE"
CHANGED_FILES=$(git diff --name-only --since="00:00" 2>/dev/null || echo "")

if [ -z "$CHANGED_FILES" ]; then
  echo "[文档] 今日无 git 变更记录"
  CHANGED_SUMMARY="今日无文件变更"
else
  echo "[文档] 今日变更："
  echo "$CHANGED_FILES"
  CHANGED_SUMMARY=$(echo "$CHANGED_FILES" | tr '\n' ', ')
fi

# 生成今日变更章节
CHANGELOG_ENTRY="## 📝 今日变更（$DATE）
- 自动文档更新：分析变更文件 $CHANGED_SUMMARY
"

# 读取现有 SYSTEM-REFERENCE.md
DOC_FILE="$DOCS_DIR/SYSTEM-REFERENCE.md"
if [ -f "$DOC_FILE" ]; then
  # 找到 "## 📝 今日变更" 的位置，替换其后所有内容
  # 如果没有今日变更章节，就在最前面插入
  if grep -q "## 📝 今日变更" "$DOC_FILE"; then
    # 替换从今日变更到文档末尾的内容
    awk -v new_entry="$CHANGELOG_ENTRY" '
      BEGIN { in_today=0 }
      /^## 📝 今日变更/ { in_today=1; print new_entry; next }
      /^## [📝🔄]/ && in_today { in_today=0 }
      in_today == 0 { print }
    ' "$DOC_FILE" > "${DOC_FILE}.tmp" && mv "${DOC_FILE}.tmp" "$DOC_FILE"
  else
    # 在文件开头插入
    echo "$CHANGELOG_ENTRY" | cat - "$DOC_FILE" > "${DOC_FILE}.tmp" && mv "${DOC_FILE}.tmp" "$DOC_FILE"
  fi
fi

echo "[文档] ✓ docs/SYSTEM-REFERENCE.md 已更新"
