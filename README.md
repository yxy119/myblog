# 个人博客

一个使用 Vue 3 构建的简单个人博客前端应用，支持文章展示和评论功能。

## 功能特性

- 📝 文章列表展示
- 📄 文章详情查看
- 💬 评论功能（支持本地存储）
- 🎨 现代化 UI 设计
- 📱 响应式布局

## 技术栈

- Vue 3
- Vite
- 原生 CSS

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
├── index.html          # HTML 入口文件
├── package.json        # 项目配置
├── vite.config.js     # Vite 配置
├── src/
│   ├── main.js        # 应用入口
│   ├── App.vue        # 根组件
│   ├── style.css      # 全局样式
│   └── components/
│       ├── ArticleList.vue      # 文章列表组件
│       ├── ArticleDetail.vue    # 文章详情组件
│       └── CommentSection.vue   # 评论组件
└── README.md          # 项目说明
```

## 使用说明

1. 文章列表页面显示所有文章
2. 点击文章卡片可以查看详情
3. 在文章详情页面可以发表评论
4. 评论会保存在浏览器的 localStorage 中

## 自定义

- 修改 `src/App.vue` 中的 `articles` 数组来添加或修改文章
- 修改 `src/style.css` 来调整全局样式
- 修改各个组件文件来调整功能和样式

