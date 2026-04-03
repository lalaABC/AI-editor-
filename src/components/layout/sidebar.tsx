'use client';

import {
  ChevronRight,
  FileText,
  Folder,
  FolderPlus,
  GripVertical,
  MoreHorizontal,
  PanelLeftClose,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import * as React from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { TreeNode } from '@/lib/api/pages';
import { usePageStore } from '@/lib/store/page-store';

// ============================================================
// Types
// ============================================================

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

// 拖拽项类型常量
const DND_TYPE = 'PAGE_ITEM';

// 拖拽数据结构
type DragItem = {
  id: string;
  type: string;
  parentId: string | null;
};

// 放置位置指示器
type DropPosition = 'before' | 'after' | 'inside' | null;

// ============================================================
// Components
// ============================================================

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { tree, searchQuery, setSearchQuery, createPage, fetchPages, loading } =
    usePageStore();

  // 组件挂载时获取页面数据
  React.useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  if (collapsed) return null;

  // 过滤搜索结果（搜索时显示扁平列表）
  const filteredTree = React.useMemo(() => {
    if (!searchQuery.trim()) return tree();
    const q = searchQuery.toLowerCase();
    const results: TreeNode[] = [];
    const collectMatches = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.type === 'page' && node.title.toLowerCase().includes(q)) {
          results.push({ ...node, children: [] });
        }
        if (node.children.length > 0) {
          collectMatches(node.children);
        }
      }
    };
    collectMatches(tree());
    return results;
  }, [tree, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <aside className="flex h-full w-60 select-none flex-col border-r bg-muted/40">
      {/* 顶部工作区标题 */}
      <div className="flex h-12 items-center gap-2 px-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground font-bold text-background text-xs">
          W
        </div>
        <span className="flex-1 truncate font-medium text-sm">我的工作区</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-6 w-6"
              onClick={onToggle}
              size="icon"
              variant="ghost"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">收起侧边栏</TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      {/* 搜索栏 */}
      <div className="p-2">
        <div className="relative">
          <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
          <Input
            className="h-8 pr-2 pl-8"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索页面..."
            value={searchQuery}
          />
        </div>
      </div>

      <Separator />

      {/* 页面树 */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            加载中...
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
            {isSearching ? '没有找到匹配的页面' : '暂无页面'}
          </div>
        ) : (
          <DndProvider backend={HTML5Backend}>
            <TreeNodeList
              depth={0}
              isSearching={isSearching}
              nodes={filteredTree}
            />
          </DndProvider>
        )}
      </div>

      <Separator />

      {/* 底部操作栏 */}
      <div className="space-y-1 p-2">
        <Button
          className="h-8 w-full justify-start gap-2 text-muted-foreground text-sm"
          onClick={() => createPage({ type: 'page' })}
          variant="ghost"
        >
          <Plus className="h-4 w-4" />
          新建页面
        </Button>
        <Button
          className="h-8 w-full justify-start gap-2 text-muted-foreground text-sm"
          onClick={() => createPage({ type: 'directory' })}
          variant="ghost"
        >
          <FolderPlus className="h-4 w-4" />
          新建目录
        </Button>
      </div>
    </aside>
  );
}

// ============================================================
// Tree Node List Component
// ============================================================

type TreeNodeListProps = {
  depth: number;
  isSearching: boolean;
  nodes: TreeNode[];
};

function TreeNodeList({ nodes, depth, isSearching }: TreeNodeListProps) {
  return (
    <>
      {nodes.map((node) => (
        <TreeNodeItem
          depth={depth}
          isSearching={isSearching}
          key={node.id}
          node={node}
        />
      ))}
    </>
  );
}

// ============================================================
// Tree Node Item Component
// ============================================================

type TreeNodeItemProps = {
  depth: number;
  isSearching: boolean;
  node: TreeNode;
};

function TreeNodeItem({ node, depth, isSearching }: TreeNodeItemProps) {
  const {
    activePageId,
    setActivePage,
    expandedDirs,
    toggleDir,
    updatePage,
    deletePage,
    reorderPages,
  } = usePageStore();

  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(node.title);
  const [hovered, setHovered] = React.useState(false);
  const [dropPosition, setDropPosition] = React.useState<DropPosition>(null);

  const isExpanded = expandedDirs.has(node.id);
  const isActive = activePageId === node.id;
  const isDirectory = node.type === 'directory';
  const hasChildren = node.children.length > 0;

  // 编辑处理
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditValue(node.title);
  };

  const handleSaveEdit = async () => {
    if (editValue.trim() && editValue !== node.title) {
      await updatePage(node.id, { title: editValue.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue(node.title);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // 点击处理
  const handleClick = () => {
    if (isDirectory) {
      toggleDir(node.id);
    } else {
      setActivePage(node.id);
    }
  };

  // 删除处理
  const handleDelete = async () => {
    await deletePage(node.id);
  };

  // ============================================================
  // Drag & Drop Hooks
  // ============================================================

  const [{ isDragging }, drag] = useDrag({
    type: DND_TYPE,
    item: { id: node.id, type: DND_TYPE, parentId: node.parentId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ canDrop: _canDrop }, drop] = useDrop({
    accept: DND_TYPE,
    hover(item: DragItem, monitor) {
      if (item.id === node.id) return;

      const hoverBoundingRect = (
        ref.current as HTMLElement
      )?.getBoundingClientRect();
      if (!hoverBoundingRect) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // 判断放置位置
      const isInside =
        isDirectory &&
        hoverClientY > hoverBoundingRect.top + 8 &&
        hoverClientY < hoverBoundingRect.bottom - 8;
      const isBefore = !isInside && hoverClientY < hoverMiddleY;
      const _isAfter = !isInside && hoverClientY >= hoverMiddleY;

      setDropPosition(isInside ? 'inside' : isBefore ? 'before' : 'after');
    },
    canDrop(item: DragItem) {
      // 防止将父节点拖入其子节点
      const isDescendant = (
        parentId: string | null,
        targetId: string
      ): boolean => {
        if (parentId === null) return false;
        if (parentId === targetId) return true;
        const child = node.children.find((c) => c.id === parentId);
        return child ? isDescendant(child.parentId, targetId) : false;
      };
      return !isDescendant(item.parentId, node.id);
    },
    drop(item: DragItem) {
      if (item.id === node.id || !dropPosition) return;

      // 计算新的 sort 值
      let newParentId: string | null = node.parentId;
      let _newSort = node.sort;

      if (dropPosition === 'inside' && isDirectory) {
        newParentId = node.id;
        _newSort = node.children.length; // 放到目录末尾
      } else if (dropPosition === 'before') {
        newParentId = node.parentId;
        _newSort = node.sort - 0.5;
      } else if (dropPosition === 'after') {
        newParentId = node.parentId;
        _newSort = node.sort + 0.5;
      }

      // 重新排序所有同级节点
      const { tree } = usePageStore.getState();
      const siblings = tree().filter((n) => n.parentId === newParentId);
      const sortedSiblings = [...siblings]
        .filter((n) => n.id !== item.id)
        .sort((a, b) => a.sort - b.sort);

      const reorderedItems = sortedSiblings.map((n, index) => ({
        id: n.id,
        parentId: n.parentId,
        sort: index,
      }));

      // 插入被拖拽的节点
      const insertIndex =
        dropPosition === 'after'
          ? sortedSiblings.findIndex((n) => n.id === node.id) + 1
          : dropPosition === 'before'
            ? sortedSiblings.findIndex((n) => n.id === node.id)
            : sortedSiblings.length;

      reorderedItems.splice(insertIndex, 0, {
        id: item.id,
        parentId: newParentId,
        sort: insertIndex,
      });

      reorderPages(reorderedItems);
      setDropPosition(null);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const ref = React.useRef<HTMLDivElement>(null);
  drag(drop(ref));

  // ============================================================
  // Render
  // ============================================================

  const paddingLeft = `${depth * 16}px`;

  return (
    <div className="relative" ref={ref}>
      {/* 拖拽指示线 */}
      {dropPosition && (
        <div
          className={`pointer-events-none absolute right-0 left-0 z-10 bg-blue-500 transition-all ${
            dropPosition === 'inside'
              ? 'top-0 bottom-0 bg-blue-500/10'
              : dropPosition === 'before'
                ? '-top-px h-0.5'
                : '-bottom-px h-0.5'
          }`}
          style={{ left: paddingLeft }}
        />
      )}

      {/* 节点行 */}
      <div
        className={`group relative flex items-center gap-1 px-2 py-0.5 ${isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}
          ${isDragging ? 'opacity-50' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ paddingLeft }}
      >
        {/* 拖拽手柄 */}
        <div
          className="cursor-grab opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-50"
          onDragStart={(e) => e.preventDefault()}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        {/* 目录展开/折叠图标 */}
        {isDirectory && (
          <Button
            className="h-5 w-5 p-0"
            onClick={handleClick}
            size="icon"
            variant="ghost"
          >
            <ChevronRight
              className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            />
          </Button>
        )}

        {/* 节点图标 */}
        <span className="shrink-0 text-sm">
          {isDirectory ? (
            <Folder className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </span>

        {/* 节点标题 */}
        {isEditing ? (
          <Input
            autoFocus
            className="h-6 flex-1 px-1 text-sm"
            onBlur={handleSaveEdit}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            value={editValue}
          />
        ) : (
          <button
            className={`flex-1 truncate text-left font-normal text-sm outline-none ${isActive ? 'text-accent-foreground' : 'text-foreground'}`}
            onClick={handleClick}
            type="button"
          >
            {node.title}
          </button>
        )}

        {/* 悬停操作按钮 */}
        {hovered && !isEditing && (
          <div className="flex items-center gap-0.5">
            <Button
              className="h-6 w-6 p-0"
              onClick={handleStartEdit}
              size="icon"
              variant="ghost"
            >
              <Pencil className="h-3 w-3 text-muted-foreground" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-6 w-6 p-0" size="icon" variant="ghost">
                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleStartEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  重命名
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* 子节点递归渲染 */}
      {isDirectory && isExpanded && hasChildren && !isSearching && (
        <div className="overflow-hidden transition-all duration-200">
          <TreeNodeList
            depth={depth + 1}
            isSearching={false}
            nodes={node.children}
          />
        </div>
      )}
    </div>
  );
}
