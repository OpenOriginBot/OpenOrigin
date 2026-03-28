# SKILL.md - 高管晨会

## 用途
并行拉起三名部门主管智能体，收集各自工作汇报，汇总生成结构化晨会纪要，保存到 `team/meetings/` 目录，支持定时自动执行或手动触发。

---

## 触发方式

- **运行方式：** 定时计划（手动也支持）
- **执行计划：** `30 8 * * 1-5`（工作日上午08:30）
- **运行用户：** root
- **工作目录：** `/root/.openclaw/workspace`

---

## 操作步骤

### 1. 准备委派消息
生成发给各主管的汇报请求消息：

```
你是 [主管名称]（[emoji]）。
请汇报以下内容，每个部分不超过3句话：
1. 当前进度（来自 /api/pm-board）
2. 阻滞问题（无阻塞填「无」）
3. 今日承诺事项
4. 跨部门协作需求（无填「无」）

回复格式：简洁分点，不超过200字。
```

### 2. 并行拉起三名主管
使用 `openclaw agent` 并行发送消息：
```bash
openclaw agent ops-head --message "..." --json &
openclaw agent mkt-head --message "..." --json &
openclaw agent rev-head --message "..." --json &
```

### 3. 等待响应（最短10分钟，最长15分钟）
- 每30秒检查一次响应
- 10分钟内无响应记录警告
- 15分钟超时后强制汇总

### 4. 汇总响应
收集各主管响应，解析并格式化。

### 5. 生成纪要文件
创建 `team/meetings/YYYY-MM-DD-每日同步会议.md`：

```markdown
# 高管晨会纪要 - YYYY-MM-DD

## ⏱️ 运营主管汇报
### 当前进度
- ...

## ✨ 营销主管汇报
### 当前进度
- ...

## 💰 营收主管汇报
### 当前进度
- ...

## 跨部门协作
- ...

## 会议信息
- 时间：YYYY-MM-DD HH:MM
- 时长：X分钟
- 出席：⏱️运营 ✅ | ✨营销 ✅ | 💰营收 ✅/❌超时
- 记录：自动生成
```

### 6. 生成会议列表索引
更新 `team/meetings/index.json`（如存在）。

---

## 输入项

| 名称 | 来源 | 说明 |
|------|------|------|
| 主管列表 | `team/data/org-chart.json` | 三名主管信息 |
| 项目看板 | `/api/pm-board` | 任务进度数据 |
| 晨会模板 | `scripts/morning-meeting/prompts/morning-briefing-template.md` | 汇报模板 |

---

## 输出项

- **晨会纪要：** `team/meetings/YYYY-MM-DD-每日同步会议.md`
- **会议索引：** `team/meetings/index.json`（更新）
- **日志文件：** `scripts/logs/morning-meeting.log`

---

## 校验方式

### 成功校验
- 纪要文件存在
- 包含至少2名主管汇报
- 文件大小 > 500字节

### 失败校验
- 无主管响应
- 纪要文件未生成
- 脚本异常退出

---

## 超时处理

| 等待时间 | 处理 |
|----------|------|
| <10分钟 | 继续等待 |
| 10-15分钟 | 无响应主管标记为「❌超时」 |
| >15分钟 | 强制汇总，已收集的正常处理 |

---

## 故障处理

| 故障 | 处理方式 |
|------|----------|
| 主管进程崩溃 | 标记为「❌异常」继续汇总 |
| 网络问题 | 重试1次，仍失败标记超时 |
| 纪要写入失败 | 输出到日志，发送告警 |

---

## 相关文件

- **脚本路径：** `/root/.openclaw/workspace/scripts/morning-meeting/meeting.sh`
- **纪要目录：** `/root/.openclaw/workspace/team/meetings/`
- **主管配置：** `/root/.openclaw/workspace/team/data/org-chart.json`
- **项目看板：** `/api/pm-board` |

---

## 依赖服务

| 服务 | 要求 |
|------|------|
| OpenClaw Gateway | 必须运行 |
| `openclaw agent` 命令 | 必须可用 |
| 三名主管 | 必须已注册 |

---

## 注意事项

- 并行拉起主管，不等待一个完成再拉下一个
- 不代为处理工作，只收集汇报
- 晨会必须生成纪要（即使部分主管超时）
