# TOOLS.md - 营销部工具配置

## 平台入口

### 1688商家后台

| 项目 | 内容 |
|------|------|
| **店铺地址** | https://pingandahua.1688.com |
| **生意参谋** | https://sycm.1688.com |
| **数据刷新** | 每日10:00 |

---

## 内容创作工具

| 工具 | 用途 | 状态 |
|------|------|------|
| 稿定设计 | 主图/Banner设计 | [待配置] |
| Photoshop | 图片处理 | [待配置] |
| Canva | 简单图文制作 | [待配置] |
|剪映 | 视频剪辑 | [待配置] |

---

## 本地文件路径

| 文件 | 路径 | 用途 |
|------|------|------|
| 部门文件根目录 | /root/.openclaw/workspace/team/mkt-head/ | 主目录 |
| 每日日志 | /root/.openclaw/workspace/team/mkt-head/memory/ | 日志存储 |
| 共享数据 | /root/.openclaw/workspace/team/data/ | 组织级数据 |
| 图库 | /root/.openclaw/workspace/team/mkt-head/assets/images/ | 图片素材 |
| 文案库 | /root/.openclaw/workspace/team/mkt-head/assets/copy/ | 文案素材 |
| 模板库 | /root/.openclaw/workspace/team/mkt-head/templates/ | 详情页模板 |

---

## 素材管理

### 图库分类

```
assets/images/
├── products/          # 产品图
│   ├── raw/          # 原图
│   └── edited/       # 加工后
├── scenarios/        # 场景图
├── buyers/           # 买家秀
└── banners/         # 活动Banner
```

### 竞品分析文件

| 竞品 | 分析文件 | 更新频率 |
|------|----------|----------|
| [待补充] | [待配置] | 每周 |

---

## 数据文件

| 文件 | 路径 | 更新频率 |
|------|------|----------|
| 流量数据 | /root/.openclaw/workspace/team/data/traffic.md | 每日 |
| 转化漏斗 | /root/.openclaw/workspace/team/data/funnel.md | 每日 |
| 评价记录 | /root/.openclaw/workspace/team/data/reviews.md | 实时 |

---

## 项目管理

- **看板数据：** /root/.openclaw/workspace/projects/openzeno/src/data/pm-tasks.json
- **API接口：** GET /api/pm-board, PATCH /api/pm-board/:id
- **看板地址：** http://127.0.0.1:8800（本地开发）

---

## 快捷命令

```bash
# 查看今日转化数据
cat /root/.openclaw/workspace/team/data/traffic.md | tail -7

# 查看最新差评
cat /root/.openclaw/workspace/team/data/reviews.md | grep "差评" | tail -5

# 查看本周转化漏斗
cat /root/.openclaw/workspace/team/data/funnel.md | tail -7
```

---

## 紧急联系人

| 场景 | 联系人 | 方式 |
|------|--------|------|
| 差评危机 | CEO | [待配置] |
| 平台违规 | 1688客服 | 400-800-1688 |
| 竞品突发 | [待配置] | [待配置] |

---

_本文件定义营销部工具配置，敏感信息需加密存储。_
