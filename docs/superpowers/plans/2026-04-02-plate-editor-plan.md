# Plate AI 编辑器实施计划

> **对于 AI 代理：** 必要子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐步执行此计划。步骤使用复选框 (`- [ ]`) 语法追踪。

**目标：** 基于 Plate playground 模板构建 AI 增强编辑器，禁用协作功能，改造 AI 为直连提供商模式

**架构：** 复制 plate-playground-template 全部代码到 Editor 目录，注释掉协作插件，改造 AI API 路由和设置面板支持多提供商直连

**技术栈：** Next.js 16.2 + React 19 + TypeScript 6 + Tailwind CSS 4 + Plate 52.x + Vercel AI SDK 6

---

## 文件结构映射

### 新增/修改的关键文件

| 文件 | 负责内容 | 操作 |
|------|---------|------|
| `src/components/editor/editor-kit.tsx` | 插件集合 | 修改：注释协作插件 |
| `src/components/editor/editor-base-kit.tsx` | 基础插件集 | 保持不变 |
| `src/components/editor/plate-editor.tsx` | 编辑器初始化 | 修改：清理初始值 |
| `src/app/page.tsx` | 首页 | 修改：直接渲染编辑器 |
| `src/app/editor/page.tsx` | 编辑器页面（旧） | 删除 |
| `src/app/api/ai/command/route.ts` | AI 命令 API | 修改：替换 Gateway 为直连 |
| `src/app/api/ai/copilot/route.ts` | AI Copilot API | 修改：替换 Gateway 为直连 |
| `src/components/editor/settings-dialog.tsx` | 设置面板 | 修改：多提供商配置 |
| `src/components/editor/use-chat.ts` | AI 聊天 Hook | 修改：移除 discussion 依赖 |
| `src/components/ui/ai-menu.tsx` | AI 菜单 | 修改：移除协作相关引用 |
| `package.json` | 依赖 | 修改：替换 Gateway SDK |
| `.env.example` | 环境变量 | 新增：多提供商配置模板 |

---

## Task 1: 复制模板并初始化项目

**文件：**
- 创建：整个项目目录（从模板复制）
- 修改：`.git/`（全新 git init）

- [ ] **Step 1: 复制模板文件到 Editor 目录**

```bash
# 将 playground-template 的所有内容复制到 Editor 目录（跳过 node_modules）
rsync -av --exclude='node_modules' --exclude='.next' --exclude='.git' \
  /Users/jay/Documents/AiProject/plate-project/templates/plate-playground-template/ \
  /Users/jay/Documents/AiProject/Editor/
```

- [ ] **Step 2: 清理旧的 git 并重新初始化**

```bash
cd /Users/jay/Documents/AiProject/Editor
rm -rf .git
git init
```

- [ ] **Step 3: 安装依赖并验证项目可运行**

```bash
cd /Users/jay/Documents/AiProject/Editor
bun install
PORT=3001 bun run dev
```

运行: 在浏览器中打开 http://localhost:3001/editor
预期: 编辑器正常加载，所有功能可用

- [ ] **Step 4: 停止开发服务器，提交初始代码**

```bash
cd /Users/jay/Documents/AiProject/Editor
git add -A
git commit -m "初始化：复制 plate-playground-template 到 Editor 项目"
```

---

## Task 2: 禁用协作插件（保留代码）

**文件：**
- 修改：`src/components/editor/editor-kit.tsx`
- 修改：`src/components/editor/editor-base-kit.tsx`

- [ ] **Step 1: 修改 editor-kit.tsx，注释掉协作插件**

在 `editor-kit.tsx` 中，找到以下部分并注释掉：

```tsx
// 将这些行注释掉（保留代码，未来可恢复）：
// // Collaboration
// ...DiscussionKit,
// ...CommentKit,
// ...SuggestionKit,
```

同时注释掉对应的 import 语句（保留但注释）：

```tsx
// import { CommentKit } from '@/components/editor/plugins/comment-kit';
// import { CursorOverlayKit } from '@/components/editor/plugins/cursor-overlay-kit';
// import { DiscussionKit } from '@/components/editor/plugins/discussion-kit';
// import { SuggestionKit } from '@/components/editor/plugins/suggestion-kit';
```

注意：`CursorOverlayKit` 也需要在 Editing 部分注释掉，因为它用于多用户光标显示。

- [ ] **Step 2: 修改 editor-base-kit.tsx，注释掉协作基础插件**

```tsx
// 注释掉这些 import 和数组元素：
// import { BaseCommentKit } from './plugins/comment-base-kit';
// import { BaseSuggestionKit } from './plugins/suggestion-base-kit';

// 在 BaseEditorKit 数组中注释掉：
// ...BaseCommentKit,
// ...BaseSuggestionKit,
```

- [ ] **Step 3: 验证项目编译通过**

```bash
cd /Users/jay/Documents/AiProject/Editor
bun run typecheck
```

预期: 编译通过，无类型错误（可能有 import 警告但不影响）

- [ ] **Step 4: 提交**

```bash
git add src/components/editor/editor-kit.tsx src/components/editor/editor-base-kit.tsx
git commit -m "禁用协作插件：注释掉 Discussion/Comment/Suggestion/CursorOverlay"
```

---

## Task 3: 清理编辑器初始值（移除协作演示数据）

**文件：**
- 修改：`src/components/editor/plate-editor.tsx`

- [ ] **Step 1: 移除初始值中的协作相关内容**

在 `plate-editor.tsx` 的 `value` 数组中，找到并**删除**以下内容：

1. **"Collaborative Editing" 整个 h2 标题块**及其下面的包含 suggestion/comment marks 的段落块。具体是从：
```tsx
// 删除从这里开始 ↓
{
  children: [{ text: 'Collaborative Editing' }],
  type: 'h2',
},
{
  children: [
    { text: 'Review and refine content seamlessly. Use ' },
    // ... 包含 suggestion_playground1, suggestion_playground2, comment_discussion1 等的整个段落
  ],
  type: 'p',
},
// 删除到这里结束 ↑
```

2. **表格中的 Comments 和 Suggestions 行**（保留表格其他行）：
```tsx
// 删除这两行（如果存在）：
// { children: [{ text: 'Comments' }, ...], type: 'tr' },
// { children: [{ text: 'Suggestions' }, ...], type: 'tr' },
```

3. **表格中的 Collaboration 行**（如果存在）

- [ ] **Step 2: 验证编辑器正常加载**

```bash
bun run dev
```

打开 http://localhost:3001/editor，预期：
- 编辑器加载无报错
- 初始内容显示正常，无协作相关高亮
- AI 功能正常（Mock 模式）

- [ ] **Step 3: 提交**

```bash
git add src/components/editor/plate-editor.tsx
git commit -m "清理初始值：移除协作演示数据（suggestion/comment marks）"
```

---

## Task 4: 首页直接展示编辑器

**文件：**
- 修改：`src/app/page.tsx`
- 删除：`src/app/editor/` 目录（如存在）

- [ ] **Step 1: 将 page.tsx 改为直接渲染编辑器**

替换 `src/app/page.tsx` 的全部内容为：

```tsx
import { Toaster } from 'sonner';

import { PlateEditor } from '@/components/editor/plate-editor';

export default function Home() {
  return (
    <div className="h-screen w-full">
      <PlateEditor />
      <Toaster />
    </div>
  );
}
```

- [ ] **Step 2: 删除旧的编辑器路由页面**

```bash
rm -rf /Users/jay/Documents/AiProject/Editor/src/app/editor
```

- [ ] **Step 3: 验证根路径显示编辑器**

```bash
bun run dev
```

打开 http://localhost:3001，预期：直接看到编辑器界面（不再是 Next.js 默认页）

- [ ] **Step 4: 提交**

```bash
git add src/app/page.tsx
git rm -r src/app/editor/
git commit -m "首页改为直接展示编辑器，移除 /editor 子路由"
```

---

## Task 5: 移除 use-chat.ts 和 ai-menu.tsx 中的协作依赖

**文件：**
- 修改：`src/components/editor/use-chat.ts`
- 修改：`src/components/ui/ai-menu.tsx`

- [ ] **Step 1: 修改 use-chat.ts**

1. 移除 `discussion-kit` 的 import：
```tsx
// 删除这行：
// import { discussionPlugin } from './plugins/discussion-kit';
```

2. 在 `onData` 处理函数中，注释掉 `data-comment` 处理块（保留代码但禁用）：
```tsx
// 注释掉整个 if (data.type === 'data-comment') 块
// 因为 comment 功能依赖 discussionPlugin
```

3. 移除 `@platejs/comment` 的 import（如果有）：
```tsx
// 删除：
// import { getCommentKey, getTransientCommentKey } from '@platejs/comment';
```

- [ ] **Step 2: 修改 ai-menu.tsx**

1. 移除协作相关 import：
```tsx
// 删除：
// import { commentPlugin } from '@/components/editor/plugins/comment-kit';
// import { getTransientCommentKey } from '@platejs/comment';
// import { getTransientSuggestionKey } from '@platejs/suggestion';
```

2. 在 `AIMenuItems` 和 `menuStateItems` 中，找到引用 `commentPlugin`、`getTransientCommentKey`、`getTransientSuggestionKey` 的代码，注释掉相关部分。

3. 在 `aiChatItems` 中，注释掉 `comment` 相关的菜单项。

- [ ] **Step 3: 验证编译通过**

```bash
bun run typecheck
```

- [ ] **Step 4: 提交**

```bash
git add src/components/editor/use-chat.ts src/components/ui/ai-menu.tsx
git commit -m "移除 AI 模块中的协作依赖（comment/suggestion/discussion）"
```

---

## Task 6: 替换 AI Gateway 为直连提供商 SDK

**文件：**
- 修改：`package.json`
- 修改：`src/app/api/ai/command/route.ts`
- 修改：`src/app/api/ai/copilot/route.ts`

- [ ] **Step 1: 修改 package.json 依赖**

替换 `@ai-sdk/gateway` 为各提供商 SDK：

```json
{
  "dependencies": {
    // 删除：
    // "@ai-sdk/gateway": "^3.0.84",

    // 新增：
    "@ai-sdk/openai": "^2.0.0",
    "@ai-sdk/anthropic": "^2.0.0",
    "@ai-sdk/google": "^2.0.0"
  }
}
```

- [ ] **Step 2: 安装新依赖**

```bash
cd /Users/jay/Documents/AiProject/Editor
bun install
```

- [ ] **Step 3: 改造 command/route.ts 支持多提供商**

替换 `src/app/api/ai/command/route.ts` 的 provider 初始化部分：

```ts
// 替换 import
// 删除: import { createGateway } from '@ai-sdk/gateway';
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
```

添加 provider 工厂函数（在 POST 函数之前）：

```ts
type Provider = 'openai' | 'anthropic' | 'google';

const getProviderModel = (provider: Provider, apiKey: string, modelId: string) => {
  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey })(modelId);
    case 'anthropic':
      return createAnthropic({ apiKey })(modelId);
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(modelId);
    default:
      return createOpenAI({ apiKey })(modelId);
  }
};

const getDefaultModel = (provider: Provider, apiKey: string) => {
  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey })('gpt-4o-mini');
    case 'anthropic':
      return createAnthropic({ apiKey })('claude-sonnet-4-20250514');
    case 'google':
      return createGoogleGenerativeAI({ apiKey })('gemini-2.5-flash');
    default:
      return createOpenAI({ apiKey })('gpt-4o-mini');
  }
};

const getToolModel = (provider: Provider, apiKey: string) => {
  // 工具选择模型（用于意图分类、评论、表格编辑）
  switch (provider) {
    case 'openai':
      return createOpenAI({ apiKey })('gpt-4o-mini');
    case 'anthropic':
      return createAnthropic({ apiKey })('claude-sonnet-4-20250514');
    case 'google':
      return createGoogleGenerativeAI({ apiKey })('gemini-2.5-flash');
    default:
      return createOpenAI({ apiKey })('gpt-4o-mini');
  }
};
```

修改 POST 函数中的 provider 初始化：

```ts
export async function POST(req: NextRequest) {
  const { apiKey: key, ctx, messages: messagesRaw, model, provider = 'openai' } = await req.json();

  const { children, selection, toolName: toolNameParam } = ctx;

  const editor = createSlateEditor({
    plugins: BaseEditorKit,
    selection,
    value: children,
  });

  const apiKey = key || process.env[`${(provider as string).toUpperCase()}_API_KEY`];

  if (!apiKey) {
    return NextResponse.json(
      { error: `缺少 ${(provider as string).toUpperCase()} API Key` },
      { status: 401 }
    );
  }

  // ... 后续代码中所有 gatewayProvider(modelId) 替换为：
  // getProviderModel(provider, apiKey, modelId)
  // gatewayProvider(model || 'openai/gpt-4o-mini') 替换为：
  // getDefaultModel(provider, apiKey)
  // gatewayProvider(model || 'google/gemini-2.5-flash') 替换为：
  // getToolModel(provider, apiKey)
```

- [ ] **Step 4: 改造 copilot/route.ts 支持多提供商**

替换 `src/app/api/ai/copilot/route.ts`：

```ts
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const getProviderModel = (provider: string, apiKey: string, modelId: string) => {
  switch (provider) {
    case 'anthropic':
      return createAnthropic({ apiKey })(modelId);
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(modelId);
    default:
      return createOpenAI({ apiKey })(modelId);
  }
};

export async function POST(req: NextRequest) {
  const {
    apiKey: key,
    model = 'gpt-4o-mini',
    provider = 'openai',
    prompt,
    system,
  } = await req.json();

  const apiKey = key || process.env[`${provider.toUpperCase()}_API_KEY`];

  if (!apiKey) {
    return NextResponse.json(
      { error: `缺少 ${provider.toUpperCase()} API Key` },
      { status: 401 }
    );
  }

  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxOutputTokens: 50,
      model: getProviderModel(provider, apiKey, model),
      prompt,
      system,
      temperature: 0.7,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: 'AI 请求处理失败' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 5: 创建 .env.example**

```bash
cat > /Users/jay/Documents/AiProject/Editor/.env.example << 'EOF'
# AI 提供商 API Keys（按需填写）
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=

# 文件上传（可选）
UPLOADTHING_TOKEN=
EOF
```

- [ ] **Step 6: 验证编译通过**

```bash
bun run typecheck
```

- [ ] **Step 7: 提交**

```bash
git add package.json bun.lock src/app/api/ai/command/route.ts src/app/api/ai/copilot/route.ts .env.example
git commit -m "改造 AI 路由：替换 Gateway 为 OpenAI/Anthropic/Google 直连 SDK"
```

---

## Task 7: 改造设置面板为多提供商配置

**文件：**
- 修改：`src/components/editor/settings-dialog.tsx`

- [ ] **Step 1: 重新设计设置面板数据结构**

在 `settings-dialog.tsx` 中，替换 `models` 数量和分类逻辑：

```tsx
// 替换原有的 models 数组为按提供商分组的结构
type Provider = {
  id: string;
  label: string;
  models: Model[];
};

const providers: Provider[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    models: [
      { label: 'GPT-4o', value: 'gpt-4o' },
      { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
      { label: 'GPT-4.1', value: 'gpt-4.1' },
      { label: 'GPT-4.1 Mini', value: 'gpt-4.1-mini' },
      { label: 'GPT-4.1 Nano', value: 'gpt-4.1-nano' },
      { label: 'o3', value: 'o3' },
      { label: 'o4-mini', value: 'o4-mini' },
    ],
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    models: [
      { label: 'Claude Opus 4', value: 'claude-opus-4-20250514' },
      { label: 'Claude Sonnet 4', value: 'claude-sonnet-4-20250514' },
      { label: 'Claude Haiku 3.5', value: 'claude-3-5-haiku-20241022' },
    ],
  },
  {
    id: 'google',
    label: 'Google',
    models: [
      { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
      { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
      { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
    ],
  },
];
```

- [ ] **Step 2: 修改 SettingsDialog 组件的状态管理**

```tsx
export function SettingsDialog() {
  const editor = useEditorRef();

  // 从 localStorage 恢复配置
  const [config, setConfig] = React.useState(() => {
    if (typeof window === 'undefined') return { provider: 'openai', model: 'gpt-4o' };
    const saved = localStorage.getItem('ai-editor-config');
    return saved ? JSON.parse(saved) : { provider: 'openai', model: 'gpt-4o' };
  });

  const [apiKeys, setApiKeys] = React.useState<Record<string, string>>(() => {
    if (typeof window === 'undefined') return {};
    const saved = localStorage.getItem('ai-editor-keys');
    return saved ? JSON.parse(saved) : { openai: '', anthropic: '', google: '' };
  });

  const [showKey, setShowKey] = React.useState<Record<string, boolean>>({});
  const [open, setOpen] = React.useState(false);
  const [openModel, setOpenModel] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 保存到 localStorage
    localStorage.setItem('ai-editor-config', JSON.stringify(config));
    localStorage.setItem('ai-editor-keys', JSON.stringify(apiKeys));

    // 更新 AI Chat 插件配置
    const chatOptions = editor.getOptions(aiChatPlugin).chatOptions ?? {};
    editor.setOption(aiChatPlugin, 'chatOptions', {
      ...chatOptions,
      body: {
        ...chatOptions.body,
        apiKey: apiKeys[config.provider],
        model: config.model,
        provider: config.provider,
      },
    });

    // 更新 Copilot 插件配置
    const completeOptions = editor.getOptions(CopilotPlugin).completeOptions ?? {};
    editor.setOption(CopilotPlugin, 'completeOptions', {
      ...completeOptions,
      body: {
        ...completeOptions.body,
        apiKey: apiKeys[config.provider],
        model: config.model,
        provider: config.provider,
      },
    });

    setOpen(false);
  };

  // ... 渲染部分：提供商选择器 + 对应 API Key 输入 + 模型选择器
}
```

- [ ] **Step 3: 重写 UI 渲染部分**

UI 改为三个部分：
1. **提供商选择** — 三个按钮（OpenAI / Anthropic / Google）
2. **API Key 输入** — 根据选中的提供商显示对应 Key 输入框
3. **模型选择** — 下拉菜单，模型列表根据提供商动态变化

保留原有的视觉风格（Command 组件 + Popover），只调整数据和交互逻辑。

- [ ] **Step 4: 验证设置面板功能**

```bash
bun run dev
```

在编辑器中点击设置图标，预期：
- 可以选择提供商
- API Key 输入框随提供商切换
- 模型列表根据提供商动态更新
- 配置保存到 localStorage

- [ ] **Step 5: 提交**

```bash
git add src/components/editor/settings-dialog.tsx
git commit -m "改造设置面板：支持多提供商配置和 localStorage 持久化"
```

---

## Task 8: 更新 metadata 和品牌信息

**文件：**
- 修改：`src/app/layout.tsx`

- [ ] **Step 1: 更新页面元数据**

```tsx
export const metadata: Metadata = {
  description: 'AI 增强富文本编辑器',
  title: 'AI Editor',
};
```

- [ ] **Step 2: 提交**

```bash
git add src/app/layout.tsx
git commit -m "更新页面元数据：修改标题和描述"
```

---

## Task 9: 完整验证和清理

**文件：**
- 检查：所有修改过的文件

- [ ] **Step 1: 运行类型检查**

```bash
bun run typecheck
```

预期: 通过，无错误

- [ ] **Step 2: 运行 lint**

```bash
bun run lint
```

预期: 通过，无严重错误

- [ ] **Step 3: 构建生产版本**

```bash
bun run build
```

预期: 构建成功

- [ ] **Step 4: 完整功能验证**

启动开发服务器 `bun run dev`，验证以下功能：

| 功能 | 验证方式 | 预期结果 |
|------|---------|---------|
| 编辑器加载 | 打开首页 | 编辑器正常显示 |
| 基础编辑 | 输入文字、格式化 | 正常 |
| AI Command | Cmd+J | 弹出 AI 菜单（Mock 模式） |
| AI Copilot | 在段落中暂停输入 | 出现幽灵文本建议 |
| Slash 命令 | 输入 / | 弹出命令菜单 |
| 表格 | 插入表格 | 正常渲染和编辑 |
| 拖拽 | 拖动块 | 正常排序 |
| Markdown 导出 | 工具栏导出按钮 | 正常导出 |
| 无协作痕迹 | 检查界面 | 无评论/建议/多人光标 |
| 设置面板 | 点击设置 | 多提供商选择正常 |

- [ ] **Step 5: 最终提交**

```bash
git add -A
git commit -m "完成阶段一：基础搭建完成，协作禁用，AI 直连架构就绪"
```

---

## 后续阶段（不在本次实施范围）

### 阶段二：AI 直连接入
- 接入真实 OpenAI / Claude / Gemini API
- 测试所有 AI 功能的流式响应
- 优化 Mock 降级体验

### 阶段三：UI 定制
- 调整编辑器布局和配色
- 自定义工具栏
- 品牌化改造（Logo、名称）
- 响应式设计优化
