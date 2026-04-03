import { nanoid } from 'platejs';

// ============================================================
// Types
// ============================================================

export type PageNode = {
  id: string;
  parentId: string | null;
  type: 'page' | 'directory';
  title: string;
  icon: string;
  sort: number;
  content?: unknown[];
  createdAt: string;
  updatedAt: string;
};

export type TreeNode = PageNode & {
  children: TreeNode[];
};

// ============================================================
// Mock data (开发阶段使用，后端对接后替换为真实 API)
// ============================================================

const defaultContent = [
  { children: [{ text: '开始编写你的内容...' }], type: 'p' },
];

const seedPages: PageNode[] = [
  {
    id: 'dir-1',
    parentId: null,
    type: 'directory',
    title: '工作文档',
    icon: '📁',
    sort: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-1',
    parentId: 'dir-1',
    type: 'page',
    title: '项目规划',
    icon: '📄',
    sort: 0,
    content: defaultContent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-2',
    parentId: 'dir-1',
    type: 'page',
    title: '会议记录',
    icon: '📝',
    sort: 1,
    content: defaultContent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-3',
    parentId: null,
    type: 'page',
    title: '开始使用',
    icon: '🚀',
    sort: 1,
    content: [
      {
        children: [{ text: '欢迎使用 AI 编辑器！' }],
        type: 'h1',
      },
      {
        children: [
          {
            text: '这是一个功能丰富的富文本编辑器，支持 AI 写作辅助、Markdown 快捷输入、表格、代码块等。',
          },
        ],
        type: 'p',
      },
      {
        children: [{ text: '核心功能' }],
        type: 'h2',
      },
      {
        children: [
          { text: '按 ' },
          { kbd: true, text: '⌘+J' },
          { text: ' 打开 AI 命令面板' },
        ],
        type: 'p',
      },
      {
        children: [
          { text: '输入 ' },
          { kbd: true, text: '/' },
          { text: ' 打开块选择菜单' },
        ],
        type: 'p',
      },
      {
        children: [{ text: '选中文字后出现浮动格式化工具栏' }],
        type: 'p',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'page-4',
    parentId: null,
    type: 'page',
    title: '学习笔记',
    icon: '📚',
    sort: 2,
    content: defaultContent,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ============================================================
// In-memory mock store
// ============================================================

let mockPages: PageNode[] = [...seedPages];

// ============================================================
// API functions (mock, 替换为真实 fetch 即可对接后端)
// ============================================================

export const pagesApi = {
  /** 获取所有页面 */
  async list(): Promise<PageNode[]> {
    // TODO: 替换为 fetch('/api/pages')
    return [...mockPages];
  },

  /** 获取单个页面（含 content） */
  async get(id: string): Promise<PageNode | null> {
    // TODO: 替换为 fetch(`/api/pages/${id}`)
    return mockPages.find((p) => p.id === id) ?? null;
  },

  /** 创建页面/目录 */
  async create(
    input: Partial<Omit<PageNode, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<PageNode> {
    // TODO: 替换为 fetch('/api/pages', { method: 'POST', body: input })
    const now = new Date().toISOString();
    const page: PageNode = {
      id: nanoid(),
      parentId: input.parentId ?? null,
      type: input.type ?? 'page',
      title:
        input.title ?? (input.type === 'directory' ? '新建目录' : '无标题'),
      icon: input.icon ?? (input.type === 'directory' ? '📁' : '📄'),
      sort: input.sort ?? 0,
      content: input.type === 'directory' ? undefined : defaultContent,
      createdAt: now,
      updatedAt: now,
    };
    mockPages.push(page);
    return page;
  },

  /** 更新页面 */
  async update(id: string, input: Partial<PageNode>): Promise<PageNode | null> {
    // TODO: 替换为 fetch(`/api/pages/${id}`, { method: 'PATCH', body: input })
    const idx = mockPages.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    mockPages[idx] = {
      ...mockPages[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return mockPages[idx];
  },

  /** 删除页面（含子节点） */
  async delete(id: string): Promise<{ success: boolean }> {
    // TODO: 替换为 fetch(`/api/pages/${id}`, { method: 'DELETE' })
    const idsToDelete = new Set<string>();

    const collectChildren = (parentId: string) => {
      idsToDelete.add(parentId);
      for (const p of mockPages) {
        if (p.parentId === parentId) {
          collectChildren(p.id);
        }
      }
    };

    collectChildren(id);
    mockPages = mockPages.filter((p) => !idsToDelete.has(p.id));
    return { success: true };
  },

  /** 批量更新排序 */
  async reorder(
    items: { id: string; parentId: string | null; sort: number }[]
  ): Promise<{ success: boolean }> {
    // TODO: 替换为 fetch('/api/pages/reorder', { method: 'POST', body: { items } })
    for (const item of items) {
      const idx = mockPages.findIndex((p) => p.id === item.id);
      if (idx !== -1) {
        mockPages[idx].parentId = item.parentId;
        mockPages[idx].sort = item.sort;
        mockPages[idx].updatedAt = new Date().toISOString();
      }
    }
    return { success: true };
  },

  /** 搜索页面 */
  async search(query: string): Promise<PageNode[]> {
    // TODO: 替换为 fetch(`/api/pages/search?q=${query}`)
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return mockPages.filter(
      (p) => p.type === 'page' && p.title.toLowerCase().includes(q)
    );
  },
};

// ============================================================
// Tree utilities
// ============================================================

/** 将扁平列表转为树形结构 */
export function buildTree(pages: PageNode[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const page of pages) {
    map.set(page.id, { ...page, children: [] });
  }

  const sorted = [...pages].sort((a, b) => a.sort - b.sort);

  for (const page of sorted) {
    const node = map.get(page.id)!;
    if (page.parentId && map.has(page.parentId)) {
      map.get(page.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/** 获取从根到指定节点的路径 */
export function getBreadcrumbs(pages: PageNode[], pageId: string): PageNode[] {
  const map = new Map(pages.map((p) => [p.id, p]));
  const path: PageNode[] = [];
  let current = map.get(pageId);

  while (current) {
    path.unshift(current);
    current = current.parentId ? map.get(current.parentId) : undefined;
  }

  return path;
}
