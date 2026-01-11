# 🎯 QR Code Tool - 二维码生成工具

一个现代化的二维码生成工具，支持云端历史记录存储。

![Tech Stack](https://img.shields.io/badge/Node.js-Express-green)
![Database](https://img.shields.io/badge/Database-Supabase-3ecf8e)
![Frontend](https://img.shields.io/badge/Frontend-HTML%2FJS-orange)

## ✨ 功能特性

- 🔲 **即时生成** - 输入任意文本/链接，一键生成高清二维码
- ☁️ **云端存储** - 历史记录自动同步到 Supabase 数据库
- 📱 **响应式设计** - 完美适配桌面端和移动端
- 🎨 **精美 UI** - 玻璃态设计，动态光效背景
- ⚡ **实时同步** - 多设备历史记录实时共享

## 🏗️ 项目结构

```
test-qrtool1/
├── public/               # 前端静态文件
│   └── index.html       # 主页面 (含 CSS + JS)
├── server/               # 后端服务
│   └── index.js         # Express 服务器 + API
├── database/             # 数据库脚本
│   └── schema.sql       # Supabase 表结构
├── .env.example          # 环境变量示例
├── package.json          # 项目依赖
└── README.md             # 项目文档
```

## 🚀 快速开始

### 1. 配置 Supabase

1. 访问 [Supabase](https://supabase.com) 并创建新项目
2. 进入 **SQL Editor**，执行 `database/schema.sql` 中的 SQL
3. 在 **Settings > API** 中获取:
   - `Project URL` → SUPABASE_URL
   - `anon public` key → SUPABASE_ANON_KEY

### 2. 配置环境变量

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑 .env 文件，填入你的 Supabase 信息
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=3000
```

### 3. 安装依赖

```bash
npm install
```

### 4. 启动服务

```bash
npm start
```

访问 http://localhost:3000 即可使用！

## 📡 API 文档

| 方法 | 端点 | 描述 |
|------|------|------|
| `GET` | `/api/history` | 获取所有历史记录 |
| `POST` | `/api/history` | 添加新记录 |
| `DELETE` | `/api/history/:id` | 删除指定记录 |
| `DELETE` | `/api/history` | 清空所有记录 |
| `GET` | `/api/health` | 健康检查 |

### 请求示例

```javascript
// 添加历史记录
fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: 'https://example.com' })
});
```

## 🛠️ 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **后端**: Node.js + Express.js
- **数据库**: Supabase (PostgreSQL)
- **二维码**: QRCode.js

## 📝 开发说明

如需修改前端样式或逻辑，编辑 `public/index.html` 文件。
后端 API 在 `server/index.js` 中定义。

## 📄 License

MIT License
