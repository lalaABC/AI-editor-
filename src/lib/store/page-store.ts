import { create } from 'zustand';

import {
  buildTree,
  getBreadcrumbs,
  type PageNode,
  type PageVersion,
  pagesApi,
  type TreeNode,
  versionsApi,
} from '@/lib/api/pages';

type PageStore = {
  // State
  pages: PageNode[];
  activePageId: string | null;
  searchQuery: string;
  expandedDirs: Set<string>;
  loading: boolean;

  // Version state
  versions: PageVersion[];
  versionsLoading: boolean;

  // Computed (as getters)
  tree: () => TreeNode[];
  breadcrumbs: () => PageNode[];
  activePage: () => PageNode | null;

  // Page Actions
  fetchPages: () => Promise<void>;
  setActivePage: (id: string) => void;
  setSearchQuery: (query: string) => void;
  toggleDir: (id: string) => void;
  createPage: (
    input: Partial<Omit<PageNode, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<PageNode>;
  updatePage: (id: string, input: Partial<PageNode>) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  reorderPages: (
    items: { id: string; parentId: string | null; sort: number }[]
  ) => Promise<void>;

  // Version Actions
  fetchVersions: (pageId: string) => Promise<void>;
  createVersion: (
    pageId: string,
    source: 'auto' | 'manual'
  ) => Promise<PageVersion | null>;
  restoreVersion: (versionId: string) => Promise<void>;
  deleteVersion: (versionId: string) => Promise<void>;
};

export const usePageStore = create<PageStore>((set, get) => ({
  // Initial state
  pages: [],
  activePageId: null,
  searchQuery: '',
  expandedDirs: new Set<string>(),
  loading: false,

  // Version state
  versions: [],
  versionsLoading: false,

  // Computed
  tree: () => buildTree(get().pages),
  breadcrumbs: () => {
    const { pages, activePageId } = get();
    if (!activePageId) return [];
    return getBreadcrumbs(pages, activePageId);
  },
  activePage: () => {
    const { pages, activePageId } = get();
    if (!activePageId) return null;
    return pages.find((p) => p.id === activePageId) ?? null;
  },

  // Actions
  fetchPages: async () => {
    set({ loading: true });
    try {
      const pages = await pagesApi.list();
      const { activePageId } = get();
      const firstPage = pages.find((p) => p.type === 'page');
      set({
        pages,
        loading: false,
        // 保留已有选中状态，仅首次加载时自动选中
        activePageId:
          activePageId && pages.find((p) => p.id === activePageId)
            ? activePageId
            : (firstPage?.id ?? null),
      });
      // 自动展开根目录
      const rootDirs = pages.filter(
        (p) => p.type === 'directory' && p.parentId === null
      );
      if (rootDirs.length > 0) {
        set({ expandedDirs: new Set(rootDirs.map((d) => d.id)) });
      }
    } catch (e) {
      console.error('加载页面失败:', e);
      set({ loading: false });
    }
  },

  setActivePage: (id) => {
    set({ activePageId: id });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  toggleDir: (id) => {
    const { expandedDirs } = get();
    const next = new Set(expandedDirs);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ expandedDirs: next });
  },

  createPage: async (input) => {
    try {
      const { pages } = get();
      // 计算正确的 sort 值，避免与已有项冲突
      const siblings = pages.filter(
        (p) => p.parentId === (input.parentId ?? null)
      );
      const maxSort =
        siblings.length > 0 ? Math.max(...siblings.map((s) => s.sort)) : -1;

      const page = await pagesApi.create({
        ...input,
        parentId: input.parentId ?? null,
        sort: maxSort + 1,
      });
      set((state) => ({ pages: [...state.pages, page] }));
      if (page.type === 'page') {
        set({ activePageId: page.id });
      }
      if (page.parentId) {
        const { expandedDirs } = get();
        if (!expandedDirs.has(page.parentId)) {
          const next = new Set(expandedDirs);
          next.add(page.parentId);
          set({ expandedDirs: next });
        }
      }
      return page;
    } catch (e) {
      console.error('创建页面失败:', e);
      throw e;
    }
  },

  updatePage: async (id, input) => {
    try {
      await pagesApi.update(id, input);
      set((state) => ({
        pages: state.pages.map((p) =>
          p.id === id
            ? { ...p, ...input, updatedAt: new Date().toISOString() }
            : p
        ),
      }));
    } catch (e) {
      console.error('更新页面失败:', e);
    }
  },

  deletePage: async (id) => {
    try {
      const { activePageId, pages } = get();
      const idsToDelete = new Set<string>();
      const collect = (parentId: string) => {
        idsToDelete.add(parentId);
        for (const p of pages) {
          if (p.parentId === parentId) collect(p.id);
        }
      };
      collect(id);

      await pagesApi.delete(id);

      const remaining = pages.filter((p) => !idsToDelete.has(p.id));
      const newActive =
        activePageId && idsToDelete.has(activePageId)
          ? (remaining.find((p) => p.type === 'page')?.id ?? null)
          : activePageId;

      set({ pages: remaining, activePageId: newActive });
    } catch (e) {
      console.error('删除页面失败:', e);
    }
  },

  reorderPages: async (items) => {
    try {
      await pagesApi.reorder(items);
      set((state) => {
        const updated = [...state.pages];
        for (const item of items) {
          const idx = updated.findIndex((p) => p.id === item.id);
          if (idx !== -1) {
            updated[idx] = {
              ...updated[idx],
              parentId: item.parentId,
              sort: item.sort,
              updatedAt: new Date().toISOString(),
            };
          }
        }
        return { pages: updated };
      });
    } catch (e) {
      console.error('排序失败:', e);
    }
  },

  // Version Actions
  fetchVersions: async (pageId) => {
    set({ versionsLoading: true });
    try {
      const versions = await versionsApi.list(pageId);
      set({ versions, versionsLoading: false });
    } catch (e) {
      console.error('加载版本历史失败:', e);
      set({ versionsLoading: false });
    }
  },

  createVersion: async (pageId, source) => {
    try {
      const page = get().pages.find((p) => p.id === pageId);
      if (!page?.content) return null;
      const version = await versionsApi.create({
        pageId,
        title: page.title,
        content: page.content,
        source,
      });
      set((state) => ({ versions: [version, ...state.versions] }));
      return version;
    } catch (e) {
      console.error('创建版本失败:', e);
      return null;
    }
  },

  restoreVersion: async (versionId) => {
    try {
      const restored = await versionsApi.restore(versionId);
      if (!restored) return;
      // 先为当前状态创建一个恢复前快照
      const { activePageId } = get();
      if (activePageId) {
        await get().createVersion(activePageId, 'manual');
      }
      // 更新本地页面数据
      set((state) => ({
        pages: state.pages.map((p) => (p.id === restored.id ? restored : p)),
      }));
    } catch (e) {
      console.error('恢复版本失败:', e);
    }
  },

  deleteVersion: async (versionId) => {
    try {
      await versionsApi.delete(versionId);
      set((state) => ({
        versions: state.versions.filter((v) => v.id !== versionId),
      }));
    } catch (e) {
      console.error('删除版本失败:', e);
    }
  },
}));
