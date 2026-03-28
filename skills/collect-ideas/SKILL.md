# SKILL.md - 夜间创意收集

## 用途
分析每日 memory/ 和其他工作区文件，从工作日志、项目记录、运营数据中发现创意想法和优化建议，更新到 `projects/openzeno/src/data/ideas.json` 供实验室模块展示。

---

## 触发方式

- **运行方式：** 定时计划
- **执行计划：** 每日凌晨（如 06:00，晨报之前）
- **运行用户：** root
- **工作目录：** `/root/.openclaw/workspace`

---

## 操作步骤

### 1. 读取昨日日志
从 `memory/YYYY-MM-DD.md` 提取：
- 任务记录中的待办事项
- 异常事件中的问题描述
- 明日待办中的计划

### 2. 分析项目看板
从 `projects/openzeno/src/data/pm-tasks.json` 提取：
- 长时间未完成的任务（>7天）
- 被阻塞的任务
- 高优先级但未启动的任务

### 3. 分析简报内容
从 `briefings/YYYY-MM-DD.md` 提取：
- 运营问题描述
- 改进建议
- 客户反馈

### 4. 生成创意条目
为每个发现生成结构化创意：

```json
{
  "id": "idea-YYYYMMDD-NNN",
  "title": "创意标题",
  "summary": "简短的描述（50字内）",
  "source": "来源：memory/pm-board/briefing",
  "date": "YYYY-MM-DD",
  "track": "A|B",
  "category": "运营/营销/产品/技术",
  "ratings": {
    "painPoint": 1-5,
    "devEfficiency": 1-5,
    "commercialization": 1-5,
    "aiAdvantage": 1-5
  },
  "createdAt": "ISO date"
}
```

### 5. 更新 ideas.json
- 读取现有 `ideas.json`
- 添加新创意（最多保留100条，超出删除最旧的）
- 按日期降序排列

### 6. 标记创意来源
在创意中标注来源，便于追溯：
- `source: "memory"` - 来自日志
- `source: "pm-board"` - 来自任务看板
- `source: "briefing"` - 来自简报

---

## 输入项

| 名称 | 来源 | 说明 |
|------|------|------|
| 昨日日志 | `memory/YYYY-MM-DD.md` | 昨夜工作记录 |
| 项目看板 | `projects/openzeno/src/data/pm-tasks.json` | 任务状态 |
| 简报 | `briefings/YYYY-MM-DD.md` | 每日摘要 |
| 现有创意 | `projects/openzeno/src/data/ideas.json` | 历史创意库 |

---

## 输出项

- **创意库：** `projects/openzeno/src/data/ideas.json`
- **日志：** 标准输出到调用方

---

## 创意分类

| 分类 | 说明 |
|------|------|
| `运营` | 流程优化、效率提升 |
| `营销` | 推广策略、内容创意 |
| `产品` | 功能改进、新品想法 |
| `技术` | 系统优化、工具开发 |

---

## 评分标准

| 维度 | 说明 |
|------|------|
| `painPoint` | 解决痛点程度（1-5） |
| `devEfficiency` | 开发效率提升（1-5） |
| `commercialization` | 商业化潜力（1-5） |
| `aiAdvantage` | AI 自动化优势（1-5） |

---

## 校验方式

### 成功校验
- `ideas.json` 文件存在
- JSON 格式有效
- 新创意已添加

### 失败校验
- JSON 格式错误
- 文件写入失败
- 磁盘空间不足

---

## 故障处理

| 故障 | 处理方式 |
|------|----------|
| 昨日日志不存在 | 跳过，安静退出 |
| ideas.json 格式错误 | 备份后重建空文件 |
| 写入失败 | 输出错误日志，返回非0 |

---

## 相关文件

- **脚本路径：** `/root/.openclaw/workspace/scripts/cron/nightly-build/collect-ideas.sh`
- **创意库：** `/root/.openclaw/workspace/projects/openzeno/src/data/ideas.json`
- **内存目录：** `/root/.openclaw/workspace/memory/`
- **简报目录：** `/root/.openclaw/workspace/briefings/`

---

## 保留策略

- 最多保留 **100 条** 创意
- 超出时删除最旧的创意
- 已实现/废弃创意标记后删除

---

## 赛道分类

| 赛道 | 说明 |
|------|------|
| `A` | 高优先级，高价值，需重点推进 |
| `B` | 探索性，需要验证 |
