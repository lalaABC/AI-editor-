'use client';

import {
  ChevronRight,
  Globe,
  History,
  MoreHorizontal,
  PanelLeft,
  Star,
} from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getBreadcrumbs } from '@/lib/api/pages';
import { usePageStore } from '@/lib/store/page-store';

import { VersionHistory } from './version-history';

type BreadcrumbProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function Breadcrumb({
  sidebarCollapsed,
  onToggleSidebar,
}: BreadcrumbProps) {
  const pages = usePageStore((s) => s.pages);
  const activePageId = usePageStore((s) => s.activePageId);
  const [versionHistoryOpen, setVersionHistoryOpen] = React.useState(false);

  const breadcrumbs = React.useMemo(
    () => (activePageId ? getBreadcrumbs(pages, activePageId) : []),
    [pages, activePageId]
  );

  return (
    <div className="flex h-11 shrink-0 items-center gap-1 border-b px-3">
      {/* Toggle sidebar button */}
      {sidebarCollapsed && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="mr-1 h-7 w-7"
              onClick={onToggleSidebar}
              size="icon"
              variant="ghost"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">展开侧边栏</TooltipContent>
        </Tooltip>
      )}

      {/* Dynamic breadcrumb path */}
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <span className="cursor-pointer truncate transition-colors hover:text-foreground">
          我的工作区
        </span>
        {breadcrumbs.map((page, i) => (
          <React.Fragment key={page.id}>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span
              className={`truncate ${
                i === breadcrumbs.length - 1
                  ? 'font-medium text-foreground'
                  : 'cursor-pointer transition-colors hover:text-foreground'
              }`}
            >
              {page.icon} {page.title}
            </span>
          </React.Fragment>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="h-7 w-7" size="icon" variant="ghost">
              <Star className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">收藏</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="h-7 w-7" size="icon" variant="ghost">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">分享</TooltipContent>
        </Tooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="h-7 w-7" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setVersionHistoryOpen(true)}>
              <History className="mr-2 h-4 w-4" />
              版本历史
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Star className="mr-2 h-4 w-4" />
              收藏此页
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Globe className="mr-2 h-4 w-4" />
              分享
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 版本历史面板 */}
      <VersionHistory
        onOpenChange={setVersionHistoryOpen}
        open={versionHistoryOpen}
      />
    </div>
  );
}
