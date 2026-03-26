# 系统参考文档

> ⚠️ **此文档由 cron 任务自动维护，请勿手动编辑（覆盖层面除外）**
> 每次 cron 执行后自动滚动更新最后变更记录。

---

## 📝 今日变更（2026-03-26）

- 初始化 SOUL.md、USER.md、AGENTS.md、TOOLS.md、MEMORY.md（电商业务配置）
- 创建 projects/OpenOrigin（React 仪表盘：Ops/Brain/Lab 三模块）
- 配置 4 个 cron 自动化任务

---

## 🏗️ 当前架构概览

```
工作区根目录：~/.openclaw/workspace/
│
├── SOUL.md           # AI 身份与价值观
├── USER.md           # 用户档案与偏好
├── AGENTS.md         # 运营规范与权限
├── TOOLS.md          # 工具与环境说明
├── MEMORY.md         # 长期记忆（供应商、账号、经验）
├── HEARTBEAT.md      # 心跳任务清单
├── STARTUP_CHECKLIST.md  # 启动检查清单
├── BOOTSTRAP.md      # 首次运行引导（待删除）
│
├── memory/           # 每日记忆流水账
│   └── YYYY-MM-DD.md
│
├── docs/             # 系统文档（自动维护）
│   └── SYSTEM-REFERENCE.md
│
├── projects/         # 业务项目
│   └── OpenOrigin/   # React 仪表盘应用
│       ├── src/
│       │   ├── modules/
│       │   │   ├── Ops/          # 任务管理器
│       │   │   ├── Brain/        # Markdown 每日简报
│       │   │   └── Lab/          # 实验仪表盘
│       │   ├── components/       # 通用 UI 组件
│       │   ├── utils/            # 工具函数
│       │   └── data/             # 种子数据
│       └── vite.config.js
│
└── .git/             # Git 版本控制
```

---

## 📦 模块清单

| 模块 | 路径 | 用途 | 状态 |
|------|------|------|------|
| OpenClaw 工作区核心 | ~/.openclaw/workspace/ | 记忆、规范、工具配置 | 活跃 |
| OpenOrigin 仪表盘 | projects/OpenOrigin/ | 任务/简报/实验三模块 UI | 活跃 |
| Ops 任务管理 | projects/OpenOrigin/src/modules/Ops/ | 客户交付任务管理 | 活跃 |
| Brain 每日简报 | projects/OpenOrigin/src/modules/Brain/ | Markdown 简报加载与展示 | 活跃 |
| Lab 实验仪表盘 | projects/OpenOrigin/src/modules/Lab/ | 实验与原型跟踪 | 活跃 |

---

## ⏰ 活跃 Cron 任务

| ID | 任务名 | 执行时间 | 用途 | 状态 |
|----|--------|----------|------|------|
| `7bb01441` | 私有仓库备份 | 每天 02:00 | Git add → 语义提交 → 推送到 GitHub | 启用 |
| `45712e92` | 夜间自我改进 | 每天 03:00 | 按周轮换审计文档/待办/链接/文件/提示词 | 启用 |
| `12a6013d` | 每日简报 | 每天 07:00 | 生成当日简报，保存到 memory/YYYY-MM-DD.md | 启用 |
| `31572e18` | 滚动式OS文档 | 每天 23:00 | 更新 docs/SYSTEM-REFERENCE.md | 启用 |

---

## ⚠️ 已知问题 / 待解决

- 1688 API 尚未集成（采购流程仍需手动）
- 多平台订单汇总方案未落地
- GitHub 推送需要确认远程仓库已配置（`git remote -v` 检查）

---

## 📁 关键文件索引

| 文件 | 用途 | 维护者 |
|------|------|--------|
| `~/.openclaw/workspace/MEMORY.md` | 长期记忆：供应商白名单、采购成本基准 | 自动 + 手动 |
| `~/.openclaw/workspace/USER.md` | 用户档案（账号、偏好、痛点） | 手动 |
| `~/.openclaw/workspace/SOUL.md` | AI 身份与不可妥协原则 | 手动 |
| `projects/OpenOrigin/src/data/*.json` | 各模块种子/演示数据 | 手动 |
| `docs/SYSTEM-REFERENCE.md` | 本文档，系统架构快照 | 自动（cron） |

---

## 🔄 回滚指南

### 撤销最后提交
```bash
cd ~/.openclaw/workspace
git log --oneline -3                    # 查看最近3次提交
git reset --soft HEAD~1                 # 撤销最后一次提交（保留变更）
git reset --hard HEAD~1                 # 撤销提交且不保留变更（危险！）
```

### 禁用某个 cron 任务
```bash
openclaw cron disable <任务ID>
# 或在任务运行时：
openclaw cron remove <任务ID>
```

### 从备份恢复文件
```bash
# 查看文件历史
git log --oneline -- filename
# 恢复文件到指定版本
git checkout <commit-hash> -- filename
```

### 恢复被 cron 误删的内容
```bash
# cron 在 memory/YYYY-MM-DD.md 中记录审计结果，不删除内容
# 如需恢复任何被覆盖的文件：
git log --all --full-history -- filename
```

---

*最后自动更新：2026-03-26 22:00*
