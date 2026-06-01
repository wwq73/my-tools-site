# My Tools Site - 在线工具集合

一个基于 React + FastAPI + PostgreSQL 的全栈工具网站，灵感来自 poncy.org。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Vite + TailwindCSS + Zustand |
| 后端 | FastAPI + SQLAlchemy (异步) |
| 数据库 | PostgreSQL + pgvector |
| 缓存 | Redis |
| 部署 | Docker Compose |

## 快速开始

### 1. 克隆项目

```bash
git clone <your-repo>
cd my-tools-site
```

### 2. 启动所有服务

```bash
docker-compose up -d
```

### 3. 访问服务

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:5173 |
| 后端 API | http://localhost:8000 |
| API 文档 | http://localhost:8000/docs |
| 数据库 | localhost:5432 |

### 4. 停止服务

```bash
docker-compose down
```

## 开发模式

### 前端开发（热重载）

```bash
cd frontend
npm install
npm run dev
```

### 后端开发（热重载）

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## 项目结构

```
my-tools-site/
├── docker-compose.yml      # 一键启动
├── nginx/                  # 反向代理配置
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # 共享组件
│   │   ├── modules/        # 各工具模块
│   │   ├── pages/          # 页面
│   │   └── types/          # TypeScript 类型
│   └── ...
└── backend/                # FastAPI 后端
    ├── api/                # API 路由
    ├── models/             # 数据库模型
    ├── services/           # 业务逻辑
    └── scripts/            # 工具脚本
```

## 已实现模块

- [x] **项目骨架** - 统一布局、主题切换、响应式设计
- [x] **待办管理器** - 多列表、优先级、导入/导出
- [ ] 反应速度训练
- [ ] 中文诗词求解器
- [ ] 押韵助手
- [ ] 吉他和弦转调
- [ ] 汉字组合器
- [ ] 国际象棋
- [ ] 典故解梦

## 添加新模块步骤

1. **创建模块目录**: `frontend/src/modules/your-module/`
2. **创建页面组件**: `YourPage.tsx`
3. **添加路由**: `frontend/src/App.tsx`
4. **添加到首页**: `frontend/src/pages/HomePage.tsx` 的 `tools` 数组
5. **创建后端 API** (如需): `backend/api/your_module.py`
6. **注册路由**: `backend/api/__init__.py`

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql+asyncpg://...` |
| `REDIS_URL` | Redis 连接字符串 | `redis://localhost:6379/0` |
| `DEBUG` | 调试模式 | `true` |
| `SECRET_KEY` | 应用密钥 | - |

## 许可证

MIT
