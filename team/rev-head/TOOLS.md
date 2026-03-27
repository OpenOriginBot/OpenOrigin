# TOOLS.md - 营收部工具配置

## 平台入口

### 1688商家后台

| 项目 | 内容 |
|------|------|
| **店铺地址** | https://pingandahua.1688.com |
| **生意参谋** | https://sycm.1688.com |
| **数据刷新** | 每日10:00 |

---

## 财务工具

| 工具 | 用途 | 状态 |
|------|------|------|
| Excel/Sheets | 成本核算、数据分析 | [待配置] |
| 财务软件 | [待配置] | [待配置] |

---

## 本地文件路径

| 文件 | 路径 | 用途 |
|------|------|------|
| 部门文件根目录 | /root/.openclaw/workspace/team/rev-head/ | 主目录 |
| 每日日志 | /root/.openclaw/workspace/team/rev-head/memory/ | 日志存储 |
| 共享数据 | /root/.openclaw/workspace/team/data/ | 组织级数据 |
| 供应商库 | /root/.openclaw/workspace/team/rev-head/suppliers/ | 供应商档案 |
| 成本表 | /root/.openclaw/workspace/team/rev-head/cost/ | 成本数据 |
| 分析报表 | /root/.openclaw/workspace/team/rev-head/reports/ | 分析报告 |

---

## 供应商文件结构

```
suppliers/
├── approved/           # 已准入供应商
│   └── [supplier-id]/
│       ├── profile.md   # 供应商档案
│       ├── contract.md  # 合同
│       └── performance/ # 绩效记录
├── backup/            # 备用供应商
└── pending/          # 待评估供应商
```

---

## 数据文件

| 文件 | 路径 | 更新频率 |
|------|------|----------|
| 销售台账 | /root/.openclaw/workspace/team/data/sales-log.md | 每日 |
| 成本明细 | /root/.openclaw/workspace/team/rev-head/cost/cost-detail.md | 实时 |
| 供应商报价 | /root/.openclaw/workspace/team/rev-head/suppliers/quotes.md | 按批次 |
| 财务报表 | /root/.openclaw/workspace/team/rev-head/reports/monthly-YYYY-MM.md | 每月 |

---

## 项目管理

- **看板数据：** /root/.openclaw/workspace/projects/openzeno/src/data/pm-tasks.json
- **API接口：** GET /api/pm-board, PATCH /api/pm-board/:id
- **看板地址：** http://127.0.0.1:8800（本地开发）

---

## 快捷命令

```bash
# 查看当日销售毛利
cat /root/.openclaw/workspace/team/data/sales-log.md | tail -1

# 查看供应商报价历史
cat /root/.openclaw/workspace/team/rev-head/suppliers/quotes.md

# 查看本月成本汇总
cat /root/.openclaw/workspace/team/rev-head/reports/monthly-*.md | tail -30
```

---

## 供应商联系方式

| 供应商 | 类型 | 联系人 | 电话 | 主供产品 | 交期 | 账期 |
|--------|------|--------|------|----------|------|------|
| [待补充] | 主力 | [待补充] | [待补充] | [待补充] | [待补充] | [待补充] |
| [待补充] | 备用 | [待补充] | [待补充] | [待补充] | [待补充] | [待补充] |

---

## 紧急联系人

| 场景 | 联系人 | 方式 |
|------|--------|------|
| 供应商断供 | CEO | [待配置] |
| 财务异常 | 财务软件客服 | [待配置] |

---

_本文件定义营收部工具配置，财务数据需加密存储。_
