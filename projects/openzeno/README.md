# OpenZeno 电商仪表板

运营效率工具，聚焦客户交付任务管理、每日简报追踪、实验原型管理。

## 技术栈

- React 18 + TypeScript
- Vite 5
- React Router v6
- CSS Modules
- react-markdown

## 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
openzeno/
├── public/
│   └── briefings/        # 简报 Markdown 文件
├── src/
│   ├── components/
│   │   ├── brain/         # 大脑模块（每日简报）
│   │   ├── common/         # 通用组件（EmptyState, Loading, ErrorBoundary）
│   │   ├── lab/            # 实验室模块（实验看板）
│   │   └── ops/            # 运营模块（任务管理）
│   ├── data/               # JSON 初始化数据
│   ├── hooks/              # 自定义 Hooks
│   ├── types/              # TypeScript 类型定义
│   ├── utils/              # 工具函数
│   ├── briefings/           # 源简报文件
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 模块说明

### 运营模块 (Ops)
- 任务字段：标题、状态、截止日期、负责人、优先级
- 支持按状态/负责人/优先级筛选
- 完整 CRUD 操作
- 数据持久化到 localStorage

### 大脑模块 (Brain)
- 读取 `public/briefings/` 目录下的 .md 文件
- 按最新时间排序展示
- 点击展开查看完整 Markdown 内容

### 实验室模块 (Lab)
- 实验字段：名称、状态、下一步行动、创建时间
- 看板视图（进行中/已暂停/已完成/已归档）
- 状态快速切换

## 15分钟手动 QA 清单

### 基础检查 (2分钟)
- [ ] 页面加载无白屏或错误
- [ ] 侧边栏导航切换正常
- [ ] 三个模块入口均可访问

### 运营模块 (5分钟)
- [ ] 任务列表正常显示（4条初始数据）
- [ ] 点击「新建任务」弹出表单
- [ ] 填写表单后任务添加成功
- [ ] 筛选功能（状态/优先级/负责人）正常工作
- [ ] 编辑任务功能正常
- [ ] 删除任务有确认提示
- [ ] 状态快速切换正常
- [ ] 刷新页面数据保留（localStorage）

### 大脑模块 (4分钟)
- [ ] 简报列表正常显示
- [ ] 点击简报可展开/收起
- [ ] Markdown 内容正确渲染
- [ ] 无简报时显示空状态引导

### 实验室模块 (4分钟)
- [ ] 看板视图正常显示（4列）
- [ ] 实验数据正确分组
- [ ] 新建实验功能正常
- [ ] 状态切换功能正常
- [ ] 删除实验功能正常
- [ ] 刷新页面数据保留

### 异常处理 (2分钟)
- [ ] ErrorBoundary 组件存在
- [ ] 空状态组件正常显示
- [ ] 加载状态正常显示

## 域名配置

```
server {
    listen 8800;
    server_name oz.120619.xyz;
    location / {
        root /path/to/openzeno/dist;
        try_files $uri $uri/ /index.html;
    }
}
```
