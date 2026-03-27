# 技能系统管理规范 v1.0

> 规范 AI 技能的全生命周期管理，确保技能质量和服务稳定性。

---

## 1. 技能命名规范

### 目录命名
```
skills/
└── [category]/           # 业务分类（英文小写+连字符）
    ├── SKILL.md         # 技能定义
    ├── config.json      # 技能配置
    └── README.md        # 使用文档（可选）
```

### 文件命名
| 文件 | 命名规则 | 示例 |
|------|----------|------|
| 技能目录 | `kebab-case` | `customer-outreach` |
| 技能定义 | `SKILL.md`（大写） | `SKILL.md` |
| 配置文件 | `config.json` | `config.json` |

### ID 命名
```
skill-[category]-[序号]
```
**示例：**
- `skill-outreach-001`
- `skill-proposal-002`
- `skill-reporting-003`

---

## 2. 技能状态定义

| 状态 | 说明 | 可被调用 |
|------|------|----------|
| `active` | 正式上线，完整功能 | ✅ 是 |
| `beta` | 测试中，功能可能调整 | ⚠️ 限内部测试 |
| `deprecated` | 已废弃，保留供回溯 | ❌ 不推荐 |
| `archived` | 已归档，不可用 | ❌ 否 |

### 状态转换规则
```
beta → active    # 通过质检后升级
active → deprecated  # 计划废弃，提前30天通知
deprecated → archived  # 废弃60天后归档
beta → archived   # 测试失败直接归档
```

---

## 3. 版本管理

### 语义化版本 `v主.次.修订`
| 位置 | 变更类型 | 说明 |
|------|----------|------|
| 主版本 | 不兼容变更 | 接口格式、功能大幅调整 |
| 次版本 | 功能新增 | 新增参数、新增功能 |
| 修订 | 问题修复 | Bug修复、文档更新 |

### 版本标签格式
```
v1.2.3
```
- `v1.0.0` — 初始正式版本
- `v1.1.0` — 新增功能
- `v1.1.1` — 修复bug
- `v2.0.0` — 不兼容的大改版

### 变更记录
每次更新必须在 `SKILL.md` 的版本历史中记录：
```markdown
| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.1.0 | 2026-04-01 | 新增 XX 参数 |
```

---

## 4. 下线/废弃规则

### 废弃通知
- 计划废弃技能需提前 **30天** 在 `index.json` 和 `SKILL.md` 中标记
- 通知内容：废弃日期、替代技能、迁移指南

### 废弃检查清单
- [ ] `index.json` 状态改为 `deprecated`
- [ ] `SKILL.md` 状态改为 `deprecated`，添加废弃说明
- [ ] 更新依赖此技能的其他技能
- [ ] 通知所有使用者

### 归档时机
- 废弃 60 天后转为 `archived`
- 归档后保留文件，但不可用
- 归档超过 180 天可删除（需双重确认）

---

## 5. 权限配置

### 可见范围配置
在 `config.json` 中配置：
```json
{
  "permissions": {
    "visibility": "public",     // public | private | restricted
    "allowedAgents": [],       // 允许调用的 Agent ID 列表
    "deniedAgents": [],         // 禁止调用的 Agent ID 列表
    "rateLimit": {
      "requestsPerHour": 100,
      "requestsPerDay": 1000
    }
  }
}
```

### 权限级别说明
| 级别 | 说明 |
|------|------|
| `public` | 所有 Agent 可调用 |
| `private` | 仅所有者 Agent 可调用 |
| `restricted` | 仅 `allowedAgents` 列表中的 Agent 可调用 |

---

## 6. 质检流程

### 上线前检查
- [ ] `SKILL.md` 所有字段完整填写
- [ ] `config.json` 配置正确
- [ ] 单元测试通过
- [ ] 人工评审通过
- [ ] 文档可读性检查

### 定期审查
- **每月**：检查 `beta` 技能状态
- **每季度**：审查 `active` 技能的使用情况和性能
- **每年**：全面审查技能目录，清理归档技能

---

## 7. 故障处理

### 故障级别
| 级别 | 响应时间 | 恢复时间 |
|------|----------|----------|
| P0 严重 | 15 分钟 | 1 小时 |
| P1 高 | 1 小时 | 4 小时 |
| P2 中 | 4 小时 | 24 小时 |
| P3 低 | 24 小时 | 72 小时 |

### 故障处理流程
1. 发现故障立即标记技能状态为 `deprecated`
2. 排查问题并修复
3. 修复后重新质检
4. 上线后更新状态为 `active`

---

## 8. 目录结构示例

```
skills/
├── index.json              # 技能索引
├── MANAGEMENT.md           # 本文件
├── SKILL-TEMPLATE.md       # 技能模板
│
├── outreach/               # 外联拓展
│   ├── SKILL.md
│   └── config.json
│
├── proposal/               # 方案撰写
│   ├── SKILL.md
│   └── config.json
│
├── reporting/              # 数据报表
│   ├── SKILL.md
│   └── config.json
│
└── [future-category]/      # 未来分类预留
```

---

## 9. 命令行工具（规划中）

```bash
# 列出所有技能
openclaw skills list

# 查看技能详情
openclaw skills show <skill-id>

# 激活技能
openclaw skills activate <skill-id>

# 废弃技能
openclaw skills deprecate <skill-id>

# 搜索技能
openclaw skills search <keyword>
```

---

_此规范为 v1.0，随着技能系统迭代将持续更新。_
