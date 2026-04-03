import { create } from 'zustand';

import {
  buildTree,
  getBreadcrumbs,
  type PageNode,
  pagesApi,
  type TreeNode,
} from '@/lib/api/pages';

type PageStore = {
  // State
  pages: PageNode[];
  activePageId: string | null;
  searchQuery: string;
  expandedDirs: Set<string>;
  loading: boolean;

  // Computed (as getters)
  tree: () => TreeNode[];
  breadcrumbs: () => PageNode[];
  activePage: () => PageNode | null;

  // Actions
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
};

export const usePageStore = create<PageStore>((set, get) => ({
  // Initial state
  pages: [],
  activePageId: null,
  searchQuery: '',
  expandedDirs: new Set<string>(),
  loading: false,

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
    const pages = await pagesApi.list();
    const firstPage = pages.find((p) => p.type === 'page');
    set({
      pages,
      loading: false,
      activePageId: firstPage?.id ?? null,
    });
    // 自动展开根目录
    const rootDirs = pages.filter(
      (p) => p.type === 'directory' && p.parentId === null
    );
    if (rootDirs.length > 0) {
      set({ expandedDirs: new Set(rootDirs.map((d) => d.id)) });
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
    const page = await pagesApi.create(input);
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
  },

  updatePage: async (id, input) => {
    await pagesApi.update(id, input);
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === id
          ? { ...p, ...input, updatedAt: new Date().toISOString() }
          : p
      ),
    }));
  },

  deletePage: async (id) => {
    const { activePageId, pages } = get();
    // 收集要删除的 ID
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
  },

  reorderPages: async (items) => {
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
  },
}));
