'use client';

import {
  ChevronRight,
  Globe,
  MoreHorizontal,
  PanelLeft,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type BreadcrumbProps = {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
};

export function Breadcrumb({
  sidebarCollapsed,
  onToggleSidebar,
}: BreadcrumbProps) {
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

      {/* Breadcrumb path */}
      <div className="flex items-center gap-1 text-muted-foreground text-sm">
        <span className="cursor-pointer truncate transition-colors hover:text-foreground">
          我的工作区
        </span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate font-medium text-foreground">开始使用</span>
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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button className="h-7 w-7" size="icon" variant="ghost">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">更多选项</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
