# SKILL.md - 私有仓库备份

## 用途
将工作区变更暂存、提交并推送到 GitHub 私有仓库，保持代码资产安全。失败时通过 Telegram 发送告警通知。

---

## 触发方式

- **运行方式：** 定时计划
- **执行计划：** `0 */6 * * *`（每6小时一次）
- **运行用户：** root
- **工作目录：** `/root/.openclaw/workspace`

---

## 操作步骤

### 1. 检查变更
检查 git 仓库是否有未提交的变更：
```bash
git status --porcelain | wc -l
```
若有变更条目，执行后续步骤；若无变更，退出。

### 2. 生成提交信息
根据变更类型生成有意义的提交信息：
- 新增文件：`+ 新增 N 个文件`
- 修改文件：`+ 修改 N 个文件`
- 删除文件：`+ 删除 N 个文件`
- 未跟踪文件：`+ 未跟踪 N 个文件`

### 3. 暂存变更
```bash
git add -A
```

### 4. 提交变更
```bash
git commit -m "<生成的信息>"
```

### 5. 推送到远程（最多重试3次）
```bash
git push origin master
```
若失败，等待30秒后重试，最多3次。

### 6. 失败告警
若推送失败，发送 Telegram 告警：
```bash
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d "chat_id=${TELEGRAM_CHAT_ID}" \
  -d "text=⚠️ [OpenClaw Backup Failed] <错误信息>"
```

---

## 输入项

| 名称 | 来源 | 说明 |
|------|------|------|
| `GIT_REPO_URL` | 环境变量 | Git 仓库地址 |
| `TELEGRAM_BOT_TOKEN` | 环境变量 | Telegram 通知 Token |
| `TELEGRAM_CHAT_ID` | 环境变量 | Telegram 接收者 ID |
| 工作区变更 | `git status` | 需要提交的变更 |

---

## 输出项

- **Git 提交：** 新提交推送到远程仓库
- **日志文件：** `$WORKSPACE/scripts/logs/backup-YYYYMMDD.log`
- **Telegram 告警（失败时）：** 包含错误信息

---

## 校验方式

### 成功校验
- `git log` 显示最新提交
- 远程仓库有最新 push 的 commit
- 日志最后一行：`备份完成`

### 失败校验
- Telegram 收到告警消息
- 日志包含 `FAILURE:` 标记
- 退出码非0

---

## 故障处理

| 故障 | 处理方式 |
|------|----------|
| 无变更 | 静默退出，日志记录 `无变更，跳过提交` |
| Git 提交失败 | 重试1次，仍失败则记录错误，退出 |
| 推送失败 | 重试3次，每次间隔30秒，仍失败则发告警 |
| 网络超时 | 重试，最多重试3次 |
| Telegram 告警失败 | 静默忽略，继续执行 |

---

## 相关文件

- **脚本路径：** `/root/.openclaw/workspace/scripts/cron/backup/backup.sh`
- **日志目录：** `/root/.openclaw/workspace/scripts/logs/`
- **工作区：** `/root/.openclaw/workspace/`

---

## 环境要求

```bash
export GIT_REPO_URL='git@github.com:OpenOriginBot/OpenOrigin.git'
export TELEGRAM_BOT_TOKEN='your-bot-token'
export TELEGRAM_CHAT_ID='your-chat-id'
```
