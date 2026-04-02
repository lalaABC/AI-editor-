# Plate AI Editor - Design Spec

## Summary

基于 Plate playground 模板构建一个通用型 AI 增强编辑器。保留除多人协作外的全部功能，AI 从一开始就使用直连提供商模式（非 Gateway），API Key 本地管理。

---

## 1. Source & Approach

- **Source**: `plate-playground-template` (templates/plate-playground-template)
- **Strategy**: 完整复制模板，禁用协作插件（保留代码），改造 AI 为直连模式
- **Tech Stack**: Next.js 16.2 + React 19 + TypeScript 6 + Tailwind CSS 4 + Plate 52.x + Vercel AI SDK 6

---

## 2. Project Structure

```
Editor/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, global styles)
│   │   ├── globals.css             # Tailwind + custom styles
│   │   ├── page.tsx                # Direct editor view (no landing page)
│   │   ├── api/
│   │   │   ├── uploadthing/route.ts
│   │   │   └── ai/
│   │   │       ├── copilot/route.ts     # AI Copilot endpoint (direct provider)
│   │   │       └── command/route.ts     # AI Command endpoint (direct provider)
│   │   │           └── prompt/          # Prompt engineering modules
│   ├── components/
│   │   ├── editor/
│   │   │   ├── plate-editor.tsx         # Editor initialization
│   │   │   ├── editor-kit.tsx           # Plugin collection (collaboration commented out)
│   │   │   ├── editor-base-kit.tsx      # Base plugins for AI preview
│   │   │   ├── use-chat.ts             # AI chat hook with mock fallback
│   │   │   ├── settings-dialog.tsx      # Multi-provider API key management
│   │   │   └── plugins/                # All plugins (collaboration files kept)
│   │   └── ui/                          # All UI components (collaboration files kept)
│   ├── hooks/
│   └── lib/
├── package.json
├── next.config.ts
├── .env.local
```

---

## 3. Collaboration Module Handling

### Strategy: Keep Code, Disable Plugins

Collaboration files remain in the codebase but are **not registered** in `editor-kit.tsx`. This allows easy re-enabling in the future.

### Disabled plugins (commented out in editor-kit.tsx):
- `DiscussionKit` — discussion thread data store
- `CommentKit` — comment marks and UI
- `SuggestionKit` — suggestion marks and UI
- `CursorOverlayKit` — multi-user cursor overlay

### Retained packages:
- `@platejs/selection` — kept for table multi-cell selection support
- All collaboration UI component files kept in `ui/` directory

### Initial value cleanup:
- Remove hardcoded suggestion marks (alice/bob/charlie)
- Remove hardcoded comment marks (discussion1, discussion2)
- Remove overlapping annotation demos
- Keep all other demo content (headings, tables, media, formatting)

---

## 4. AI Module Design

### 4.1 Direct Provider Architecture

Replace `@ai-sdk/gateway` with individual provider SDKs:

| Provider | Package | Models |
|----------|---------|--------|
| OpenAI | `@ai-sdk/openai` | GPT-4o, GPT-4o-mini, GPT-5, O-series |
| Anthropic | `@ai-sdk/anthropic` | Claude Sonnet 4, Claude Opus 4, Claude Haiku |
| Google | `@ai-sdk/google` | Gemini 2.5 Pro/Flash |
| DeepSeek | `@ai-sdk/openai` (compatible) | DeepSeek V3/R1 |

### 4.2 API Route Changes

**`/api/ai/command/route.ts`:**
```
Accept: { provider, apiKey, model, messages, ctx }
→ Switch on provider:
  'openai' → createOpenAI({ apiKey })
  'anthropic' → createAnthropic({ apiKey })
  'google' → createGoogleGenerativeAI({ apiKey })
  'deepseek' → createOpenAI({ baseURL: '...', apiKey })
→ streamText({ model: provider.model(model), ... })
```

**`/api/ai/copilot/route.ts`:**
Same provider switching logic.

### 4.3 Settings Dialog Redesign

Replace single API key input with multi-provider configuration:

1. **Provider selector** — Dropdown to choose AI provider
2. **API Key input** — Per-provider API Key field
3. **Model selector** — Dynamic model list based on selected provider
4. **Storage** — localStorage with optional encryption
5. **Status indicator** — Shows connection status per provider

### 4.4 Mock Mode (Default)

When no API key is configured:
- Auto-fallback to `@faker-js/faker` mock responses
- All AI features remain functional (simulated)
- Clear visual indicator that mock mode is active

### 4.5 AI Features Retained

| Feature | Trigger | Description |
|---------|---------|-------------|
| AI Command | Cmd+J | Command palette with intent auto-detection |
| AI Copilot | Auto (500ms debounce) | Inline ghost text suggestions |
| Continue Writing | Command menu | AI continues from cursor |
| Summarize | Command menu (selection) | Summarize selected text |
| Edit/Improve | Command menu (selection) | Improve or rewrite selection |
| Table Edit | Command menu (in table) | Multi-cell table editing |
| Comment | Command menu (selection) | AI-generated comments |
| Import/Export | Toolbar | Markdown, DOCX support |

---

## 5. Routing

| Route | Purpose |
|-------|---------|
| `/` | Editor (direct, no landing page) |
| `/api/ai/command` | AI command endpoint |
| `/api/ai/copilot` | AI copilot endpoint |
| `/api/uploadthing` | File upload endpoint |

---

## 6. Development Phases

### Phase 1 — Base Setup
1. Copy playground-template to Editor directory
2. Fresh git init
3. Comment out collaboration plugins in editor-kit.tsx
4. Clean initial value (remove collab demo data)
5. Make page.tsx render editor directly
6. Verify project runs correctly

### Phase 2 — AI Direct Connection
1. Replace `@ai-sdk/gateway` with individual provider packages
2. Refactor API routes for dynamic provider initialization
3. Redesign settings dialog for multi-provider management
4. Implement localStorage persistence for API configs
5. Test mock mode as fallback

### Phase 3 — UI Customization
1. Adjust editor layout and styling
2. Customize toolbar
3. Brand identity (logo, name, colors)
4. Responsive design refinements

---

## 7. Dependencies

### Added (vs playground-template):
- `@ai-sdk/openai` — OpenAI direct connection
- `@ai-sdk/anthropic` — Claude direct connection
- `@ai-sdk/google` — Gemini direct connection

### Removed:
- `@ai-sdk/gateway` — No longer using Gateway routing

### Unchanged:
- All `@platejs/*` packages (42 packages)
- `ai` v6 (Vercel AI SDK core)
- `@ai-sdk/react` v3
- Next.js 16.2.2, React 19.2.4, Tailwind CSS 4
- All UI dependencies (Radix UI, cmdk, sonner, etc.)
