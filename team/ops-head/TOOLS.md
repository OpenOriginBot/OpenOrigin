# TOOLS.md - 运营部工具配置

## 平台入口

### 1688商家后台

| 项目 | 内容 |
|------|------|
| **店铺地址** | https://pingandahua.1688.com |
| **登录方式** | [待配置] |
| **数据刷新** | 每日09:00、14:00、20:00 |

### ERP/订单系统

| 系统 | 用途 | 状态 |
|------|------|------|
| [待配置] | 订单管理 | [待配置] |
| [待配置] | 库存管理 | [待配置] |

---

## API接口配置

| 服务 | 用途 | 状态 |
|------|------|------|
| 1688订单API | 订单同步 | [待配置] |
| 物流追踪API | 快递状态查询 | [待配置] |
| 库存同步API | 库存实时更新 | [待配置] |

---

## 本地文件路径

| 文件 | 路径 | 用途 |
|------|------|------|
| 部门文件根目录 | /root/.openclaw/workspace/team/ops-head/ | 主目录 |
| 每日日志 | /root/.openclaw/workspace/team/ops-head/memory/ | 日志存储 |
| 共享数据 | /root/.openclaw/workspace/team/data/ | 组织级数据 |
| 临时文件 | /root/.openclaw/workspace/team/ops-head/tmp/ | 临时处理 |

---

## 数据文件

| 文件 | 路径 | 更新频率 |
|------|------|----------|
| 订单台账 | /root/.openclaw/workspace/team/data/orders-log.md | 实时 |
| 库存明细 | /root/.openclaw/workspace/team/data/inventory.md | 每日 |
| 物流追踪 | /root/.openclaw/workspace/team/data/logistics.md | 实时 |

---

## 项目管理

- **看板数据：** /root/.openclaw/workspace/projects/openzeno/src/data/pm-tasks.json
- **API接口：** GET /api/pm-board, PATCH /api/pm-board/:id
- **看板地址：** http://127.0.0.1:8800（本地开发）

---

## 快捷命令

```bash
# 查看今日日志
cat /root/.openclaw/workspace/team/ops-head/memory/$(date +%Y-%m-%d).md

# 查看库存预警
cat /root/.openclaw/workspace/team/data/inventory.md | grep -i "预警"

# 查看待发货订单
cat /root/.openclaw/workspace/team/data/orders-log.md | grep "待发货"
```

---

## 供应商联系方式

| 供应商 | 联系人 | 电话 | 交期 | 备注 |
|--------|--------|------|------|------|
| [待补充] | [待补充] | [待补充] | [待补充] | 主力 |
| [待补充] | [待补充] | [待补充] | [待补充] | 备用 |

---

## 物流服务商

| 服务商 | 联系方式 | 备注 |
|--------|----------|------|
| [待补充] | [待补充] | 主力 |
| [待补充] | [待补充] | 备用 |

---

## 紧急联系人

| 场景 | 联系人 | 方式 |
|------|--------|------|
| 断货危机 | 营收主管 | [待配置] |
| 物流异常 | 物流服务商 | [待配置] |
| 平台问题 | 1688客服 | 400-800-1688 |

---

_本文件定义运营部工具配置，敏感信息需加密存储。_
