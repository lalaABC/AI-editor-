# AI Editor

基于 [Plate](https://platejs.org/) 构建的 AI 增强富文本编辑器，采用 Notion 风格布局。

## 功能特性

### 编辑器核心
- 40+ 富文本插件（标题、列表、表格、代码块、引用、数学公式等）
- Markdown 快捷输入（`#` 标题、`**` 粗体、`-` 列表等）
- 浮动工具栏（选中文本后出现格式化选项）
- 斜杠命令（`/` 触发，支持拼音首字母搜索）
- `@` 提及功能
- 拖拽排序块级元素
- Mermaid / Excalidraw 图表渲染
- DOCX 导入导出
- 数学公式（KaTeX）

### AI 能力
- AI 写作助手（`⌘+J` 唤起命令面板）
- AI 内联续写（类似 GitHub Copilot，`Tab` 接受建议）
- 多 AI 服务商支持：OpenAI / Anthropic / Google
- 右下角设置按钮配置 API Key

### 页面管理
- Notion 风格侧边栏（无限层级目录 + 页面树）
- 拖拽移动页面/目录
- 页面搜索
- 面包屑导航
- 新建页面 / 新建目录 / 重命名 / 删除

### 技术栈
- **框架**: Next.js 16 + React 19
- **编辑器**: Plate v52 (Slate)
- **UI**: shadcn/ui + Tailwind CSS 4
- **状态管理**: Zustand
- **AI SDK**: Vercel AI SDK v6（直连 OpenAI / Anthropic / Google）
- **拖拽**: react-dnd
- **语言**: 中文界面

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
pnpm start
```

访问 http://localhost:3000

## AI 配置

1. 点击右下角齿轮按钮打开设置
2. 选择 AI 服务商（OpenAI / Anthropic / Google）
3. 填入对应 API Key
4. 选择模型

> **注意**: API Key 仅存储在浏览器 localStorage 中，适用于开发/演示环境。生产环境请将密钥存储在服务端环境变量中。

## 项目结构

```
src/
├── app/                        # Next.js App Router
│   ├── page.tsx                # 主页
│   ├── layout.tsx              # 根布局
│   └── api/ai/                 # AI API 路由
│       ├── command/route.ts    # AI 命令（⌘+J）
│       └── copilot/route.ts    # AI 续写
├── components/
│   ├── editor/                 # 编辑器核心
│   │   ├── editor-kit.tsx      # 插件注册
│   │   ├── plate-editor.tsx    # 编辑器主组件
│   │   ├── settings-dialog.tsx # AI 设置弹窗
│   │   └── plugins/            # 30+ 编辑器插件
│   ├── layout/                 # 布局组件
│   │   ├── sidebar.tsx         # 侧边栏（页面树）
│   │   ├── breadcrumb.tsx      # 面包屑导航
│   │   └── editor-layout.tsx   # 主布局
│   └── ui/                     # shadcn/ui 组件
├── lib/
│   ├── api/pages.ts            # 页面数据层 + Mock API
│   └── store/page-store.ts     # Zustand 页面状态管理
└── hooks/                      # 自定义 hooks
```

## 后端对接

当前使用 Mock API（`src/lib/api/pages.ts`），包含以下接口规范：

| 方法 | 接口 | 说明 |
|------|------|------|
| GET | `/api/pages` | 获取所有页面列表 |
| GET | `/api/pages/:id` | 获取单个页面（含 content） |
| POST | `/api/pages` | 创建页面/目录 |
| PATCH | `/api/pages/:id` | 更新页面 |
| DELETE | `/api/pages/:id` | 删除页面（含子节点） |
| POST | `/api/pages/reorder` | 批量更新排序 |
| GET | `/api/pages/search?q=` | 搜索页面 |

### 数据模型

```typescript
type PageNode = {
  id: string;
  parentId: string | null;      // 父节点 ID（null 为根节点）
  type: 'page' | 'directory';   // 页面或目录
  title: string;
  icon: string;
  sort: number;                  // 同级排序
  content?: unknown[];           // Plate 编辑器内容（仅 page 类型）
  createdAt: string;
  updatedAt: string;
};
```

Mock API 中的 `TODO` 注释标记了所有需要替换为真实 `fetch` 调用的位置。

## 环境变量（生产环境）

```env
# AI 服务商（可选，也可在界面配置）
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...

# 文件上传（可选）
UPLOADTHING_TOKEN=...
```

## License

MIT
