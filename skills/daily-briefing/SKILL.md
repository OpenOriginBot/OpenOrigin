# SKILL.md - 每日简报

## 用途
生成每日早晨简报，汇总今日优先级、昨夜活动、待处理事项及运营状态，保存到 memory/ 和 briefings/ 目录，供大脑模块和 OpenZeno 仪表盘展示。

---

## 触发方式

- **运行方式：** 定时计划
- **执行计划：** `30 7 * * *`（每天07:30）
- **运行用户：** root
- **工作目录：** `/root/.openclaw/workspace`

---

## 操作步骤

### 1. 读取昨日日志
检查 `memory/YESTERDAY.md`（如 2026-03-27.md）：
- 提取任务记录（`## 任务记录` 部分）
- 提取异常事件（`## 异常事件` 部分）

### 2. 读取 MEMORY.md
获取当前项目状态：
- 店铺基础信息
- 运营优先级
- 供应商状态

### 3. 收集待处理事项
- 检查 `HEARTBEAT.md` 中的待办
- 检查各 `memory/` 文件中的未完成待办
- 检查 OpenZeno Ops 模块任务状态（如有）

### 4. 生成简报内容
按以下结构生成 Markdown：

```markdown
# 📋 每日简报 - YYYY-MM-DD

**生成时间：** HH:MM (Asia/Shanghai)

## 🎯 今日优先级
[从 MEMORY.md 加载]

## 📦 运营状态
[Ops 模块任务统计]

## 🌙 昨夜活动
[从昨日日志提取]

## ⏳ 待处理事项
[待办清单]

## 📊 项目状态
[从 MEMORY.md 加载]

## 💬 备注
[自由填写区域]
```

### 5. 保存文件
- 保存到 `memory/YYYY-MM-DD.md`
- 复制到 `briefings/YYYY-MM-DD.md`（供 Brain 模块读取）

### 6. 可选：发送 Telegram 摘要
如 `ENABLE_TELEGRAM=true`，发送简报摘要到 Telegram。

---

## 输入项

| 名称 | 来源 | 说明 |
|------|------|------|
| 昨日日志 | `memory/YYYY-MM-DD.md` | 昨夜活动记录 |
| MEMORY.md | 工作区根目录 | 当前项目状态 |
| HEARTBEAT.md | 工作区根目录 | 待办事项 |
| Ops 数据 | `projects/openzeno/src/data/ops-tasks.json` | 运营任务统计 |
| `TIMEZONE` | 环境变量 | 时区，默认 Asia/Shanghai |
| `ENABLE_TELEGRAM` | 环境变量 | 是否发送 Telegram |

---

## 输出项

- **每日日志：** `memory/YYYY-MM-DD.md`
- **简报文件：** `briefings/YYYY-MM-DD.md`
- **Telegram 摘要（可选）：** 简短版本摘要

---

## 校验方式

### 成功校验
- `memory/YYYY-MM-DD.md` 文件存在
- 文件大小 > 500字节
- 包含 `📋 每日简报` 标题

### 失败校验
- 文件未生成
- 内容为空或不完整
- 复制到 briefings 失败

---

## 故障处理

| 故障 | 处理方式 |
|------|----------|
| 昨日日志不存在 | 跳过昨夜活动部分，标记 `_无昨夜记录_` |
| MEMORY.md 读取失败 | 使用占位符，继续执行 |
| briefings 目录不存在 | 创建目录后复制 |
| Telegram 发送失败 | 静默忽略，继续执行 |

---

## 相关文件

- **脚本路径：** `/root/.openclaw/workspace/scripts/cron/briefing/daily-briefing.sh`
- **简报目录：** `/root/.openclaw/workspace/briefings/`
- **内存目录：** `/root/.openclaw/workspace/memory/`
- **OpenZeno：** `/root/.openclaw/workspace/projects/openzeno/`

---

## 模板变量

| 变量 | 格式 | 说明 |
|------|------|------|
| `TODAY` | YYYY-MM-DD | 今日日期 |
| `YESTERDAY` | YYYY-MM-DD | 昨日日期 |
| `TIMEZONE` | Asia/Shanghai | 时区 |
