# 技能系统 (Skills System)

> 电商 AI 代理操作系统的技能管理目录

---

## 快速导航

| 技能 | 说明 | 状态 |
|------|------|------|
| [外联拓展](./outreach/) | 客户外联邮件生成 | ✅ active |
| [方案撰写](./proposal/) | 解决方案文档和报价方案 | ✅ active |
| [数据报表](./reporting/) | 销售、运营数据分析报告 | ✅ active |

---

## 目录结构

```
skills/
├── index.json              # 技能索引（机器可读）
├── MANAGEMENT.md           # 管理规范
├── SKILL-TEMPLATE.md       # 技能模板
│
├── outreach/               # 外联拓展
│   ├── SKILL.md          # 技能定义
│   └── config.json       # 技能配置
│
├── proposal/               # 方案撰写
│   ├── SKILL.md
│   └── config.json
│
└── reporting/             # 数据报表
    ├── SKILL.md
    └── config.json
```

---

## 核心文件说明

| 文件 | 用途 |
|------|------|
| `index.json` | 技能索引，支持按名称/分类/状态检索 |
| `MANAGEMENT.md` | 技能全生命周期管理规范 |
| `SKILL-TEMPLATE.md` | 新建技能的模板参考 |

---

## 技能索引预览

```json
{
  "totalSkills": 3,
  "skills": [
    {
      "id": "skill-outreach-001",
      "name": "外联拓展",
      "category": "business-development",
      "status": "active"
    },
    ...
  ]
}
```

---

## 规划中的技能

| 技能 | 分类 | 优先级 |
|------|------|--------|
| 智能客服 | customer-service | 🔴 高 |
| 库存监控 | operations | 🔴 高 |
| 竞品分析 | research | 🟡 中 |
| 内容创作 | content-production | 🟡 中 |

---

## 管理规范摘要

### 命名规范
- 技能 ID：`skill-[category]-[序号]`
- 目录名：`kebab-case`
- 状态：`active` / `beta` / `deprecated` / `archived`

### 版本管理
- 语义化版本：`v主.次.修订`
- 详见 [MANAGEMENT.md](./MANAGEMENT.md)

### 权限配置
- 可见范围：`public` / `private` / `restricted`
- 详见 `config.json` 中的 `permissions` 字段

---

## 下一步

1. **查看技能详情** → 进入各技能目录阅读 `SKILL.md`
2. **创建新技能** → 复制 `SKILL-TEMPLATE.md` 并填充
3. **管理规范** → 阅读 `MANAGEMENT.md` 了解版本和下线规则

---

_此目录为技能系统 v1.0，持续迭代中_
