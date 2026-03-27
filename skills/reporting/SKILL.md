# 技能：数据报表 (Data Reporting)

| 属性 | 内容 |
|------|------|
| **技能ID** | `skill-reporting-001` |
| **版本** | v1.0.0 |
| **状态** | active |
| **分类** | data-analytics |
| **负责人** | [待定] |

---

## 用途

自动聚合多数据源的销售、运营、客户数据，生成结构化报表和分析报告。支持日报、周报、月报、自定义报表，可按需推送到指定渠道（消息/邮件/仪表板）。

---

## 触发条件

### 自动触发
- [ ] 定时任务：每日 09:00 生成日报
- [ ] 定时任务：每周一 10:00 生成周报
- [ ] 定时任务：每月1日 09:00 生成月报

### 手动触发
- [x] 用户指令：`生成销售报表` / `看看本周数据` / `做个数据分析`

**触发关键词：**
```
报表, 数据报告, 周报, 日报, 月报, 销售数据, 数据分析, 销售报表, 生成报告, report, dashboard
```

---

## 输入

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `report_type` | string | 是 | - | 报表类型 |
| `date_range` | object | 否 | today | 日期范围 |
| `data_sources` | string[] | 否 | all | 数据源 |
| `output_format` | string | 否 | markdown | 输出格式 |
| `include_charts` | boolean | 否 | false | 是否包含图表描述 |
| `segments` | string[] | 否 | all | 细分维度 |

**报表类型 (report_type)：**
| 值 | 说明 |
|------|------|
| `daily-sales` | 每日销售汇总 |
| `weekly-ops` | 周运营报告 |
| `monthly-business` | 月度业务复盘 |
| `inventory-status` | 库存状态追踪 |
| `customer-analysis` | 客户分析报告 |

**示例输入：**
```json
{
  "report_type": "weekly-ops",
  "date_range": {
    "start": "2026-03-20",
    "end": "2026-03-26"
  },
  "data_sources": ["1688", "local"],
  "output_format": "markdown",
  "include_charts": true,
  "segments": ["by_product", "by_region"]
}
```

---

## 输出

```json
{
  "success": true,
  "data": {
    "report_title": "周运营报告 - 2026.03.20~03.26",
    "period": {
      "start": "2026-03-20",
      "end": "2026-03-26"
    },
    "summary": {
      "total_orders": 156,
      "total_revenue": 89000,
      "avg_order_value": 570.5,
      "orders_change": 12.5,
      "revenue_change": 8.3
    },
    "highlights": [
      "智能灯带销量环比增长15%",
      "广东地区销售额占比40%",
      "客户评分平均4.8分"
    ],
    "sections": {
      "sales_overview": "销售概览...",
      "product_performance": "产品表现...",
      "customer_insights": "客户洞察...",
      "operational_metrics": "运营指标..."
    },
    "recommendations": [
      "建议增加智能灯带备货10%",
      "重点关注珠三角地区推广"
    ]
  },
  "metadata": {
    "tokens_used": 800,
    "execution_time_ms": 2500,
    "data_sources_used": ["1688"],
    "generated_at": "2026-03-27T09:00:00Z"
  }
}
```

---

## 约束规则

### 运行时限制
- 最大执行时间：`120 秒`
- 最大内存：`2048 MB`
- 最大调用频率：`20 次/小时`

### 数据限制
- ❌ 禁止超出授权范围访问数据
- ❌ 禁止缓存原始数据（仅缓存聚合结果）
- ❌ 禁止在报表中暴露客户敏感信息
- ✅ 数据必须标注来源和时间
- ✅ 变化率必须标注对比周期

### 准确性要求
- 金额数据保留2位小数
- 百分比保留1位小数
- 异常数据需标注（如0值、负值）

---

## 故障模式

| 故障 | 原因 | 处理方式 |
|------|------|----------|
| `E_DATA_SOURCE_UNAVAILABLE` | 数据源无法访问 | 返回部分可用数据，标注缺失来源 |
| `E_NO_DATA` | 指定周期无数据 | 返回空报表，提示可能原因 |
| `E_AGGREGATION_FAILED` | 聚合计算失败 | 返回原始数据，请求人工处理 |
| `E_TIMEOUT` | 数据量过大超时 | 返回部分报表，提示需要缩小范围 |

---

## 质检步骤

### 自动检查
- [x] 数据完整性：必含字段不为空
- [x] 数值合理性：金额为正、百分比在0-100
- [x] 格式验证：JSON/Markdown 格式正确
- [x] 来源标注：所有数据标注来源

### 人工复核（建议）
- [ ] 异常数据核实
- [ ] 业务逻辑正确性
- [ ] 报表可读性

---

## 关联技能

**依赖：**
- 无

**被依赖：**
- `skill-outreach-001` — 外联拓展（报表数据用于客户沟通）
- `skill-proposal-001` — 方案撰写（历史数据支撑方案）

---

## 版本历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0.0 | 2026-03-27 | 初始版本 |

---

## 报表类型说明

| 类型 | 周期 | 典型内容 |
|------|------|----------|
| `daily-sales` | 每日 | 订单数、销售额、客单价、热门商品 |
| `weekly-ops` | 每周 | 运营指标、环比变化、问题预警 |
| `monthly-business` | 每月 | 业务复盘、趋势分析、下月计划 |
| `inventory-status` | 实时/每日 | 库存周转、热销断货预警 |
| `customer-analysis` | 每周/每月 | 客户画像、复购率、流失预警 |

---

## 使用示例

**用户输入：**
> 生成本周的运营报告

**期望输出：**
- 周数据概览（订单数、销售额、客单价）
- 环比变化（与上周对比）
- 热销商品 TOP 5
- 库存预警（断货风险）
- 本周问题与下阶段建议
- Markdown 格式，可直接发送
