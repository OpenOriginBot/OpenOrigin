# SKILL.md - 滚动式系统文档

## 用途
每日结束时分析系统变更，更新 `docs/SYSTEM-REFERENCE.md` 文档，确保始终有一份最新的完整系统工作原理参考。

---

## 触发方式

- **运行方式：** 定时计划
- **执行计划：** `0 23 * * *`（每天23:00）
- **运行用户：** root
- **工作目录：** `/root/.openclaw/workspace`

---

## 操作步骤

### 1. 记录文档更新时间
维护 `scripts/cron/docs/.last-doc-update` 文件，记录上次更新时间。

### 2. 分析 Git 变更
若有 `.git` 目录：
```bash
git log --since="$(cat .last-doc-update)" --oneline --name-status
```
提取自上次更新以来的所有变更文件。

### 3. 更新架构概览
写入 `docs/SYSTEM-REFERENCE.md`：

```markdown
### 🏗️ 当前架构
[目录树结构]
```

### 4. 更新模块清单
- 核心配置文件（*.md）
- 项目目录
- 自动化脚本

### 5. 更新 API 路由
读取 `vite.config.mjs` 或相关配置，提取路由信息。

### 6. 更新活跃进程
检查并记录：
- OpenZeno 服务状态
- Nginx 服务状态
- 其他相关进程

### 7. 更新近期文件
列出7天内修改的文件（含路径和时间）。

### 8. 更新已知问题
从 `memory/` 目录汇总近期异常记录。

### 9. 更新今日动态
从 `memory/YYYY-MM-DD.md` 提取任务记录。

### 10. 记录更新完成
更新 `.last-doc-update` 文件为当天日期。

---

## 输入项

| 名称 | 来源 | 说明 |
|------|------|------|
| 工作区 | `/root/.openclaw/workspace/` | 系统文件和目录 |
| Git 历史 | `.git/` | 变更记录 |
| memory/ | `memory/` 目录 | 每日日志 |
| `.last-doc-update` | `scripts/cron/docs/` | 上次更新时间 |

---

## 输出项

- **系统参考文档：** `docs/SYSTEM-REFERENCE.md`
- **更新标记文件：** `scripts/cron/docs/.last-doc-update`

---

## 文档结构

`docs/SYSTEM-REFERENCE.md` 应包含：

1. **架构概览** - 目录树
2. **模块清单** - 核心文件、项目、脚本
3. **API 路由** - 接口配置
4. **活跃进程** - 服务状态
5. **近期文件** - 7天内修改
6. **Git 变更** - 自上次更新
7. **今日动态** - 任务记录
8. **已知问题** - 异常记录

---

## 校验方式

### 成功校验
- `docs/SYSTEM-REFERENCE.md` 文件存在
- 文件大小 > 1KB
- 包含 `SYSTEM-REFERENCE.md` 标题
- `.last-doc-update` 已更新

### 失败校验
- 文档未生成
- 内容不完整
- 更新文件未更新

---

## 故障处理

| 故障 | 处理方式 |
|------|----------|
| Git 仓库不存在 | 跳过变更分析部分 |
| 文件写入失败 | 记录错误，退出非0 |
| memory/ 读取失败 | 跳过该部分 |
| 目录不存在 | 创建后继续 |

---

## 相关文件

- **脚本路径：** `/root/.openclaw/workspace/scripts/cron/docs/update-docs.sh`
- **文档目录：** `/root/.openclaw/workspace/docs/`
- **更新标记：** `/root/.openclaw/workspace/scripts/cron/docs/.last-doc-update`
- **内存目录：** `/root/.openclaw/workspace/memory/`

---

## 维护周期

| 检查项 | 周期 |
|--------|------|
| 完整重建 | 每月 |
| Git 变更分析 | 每日 |
| 进程状态 | 每日 |
| 已知问题汇总 | 每日 |
