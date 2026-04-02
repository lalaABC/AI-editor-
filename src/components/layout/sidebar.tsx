'use client';

import { ChevronsUpDown, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Mock page data
const pages = [
  { id: '1', title: 'Getting Started', icon: '📄' },
  { id: '2', title: 'Project Notes', icon: '📝' },
  { id: '3', title: 'Meeting Notes', icon: '📋' },
];

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [hoveredPage, setHoveredPage] = React.useState<string | null>(null);
  const [activePage, setActivePage] = React.useState('1');

  if (collapsed) return null;

  return (
    <aside className="flex h-full w-60 select-none flex-col border-r bg-muted/40">
      {/* Workspace Header */}
      <div className="flex h-12 items-center gap-2 px-3">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground font-bold text-background text-xs">
          W
        </div>
        <span className="flex-1 truncate font-medium text-sm">
          My Workspace
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-6 w-6"
              onClick={onToggle}
              size="icon"
              variant="ghost"
            >
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Collapse sidebar</TooltipContent>
        </Tooltip>
      </div>

      <Separator />

      {/* Page List */}
      <div className="flex-1 overflow-y-auto py-1">
        {pages.map((page) => (
          <div
            className="group relative flex items-center gap-2 px-2 py-0.5"
            key={page.id}
            onMouseEnter={() => setHoveredPage(page.id)}
            onMouseLeave={() => setHoveredPage(null)}
          >
            <Button
              className={`h-8 w-full justify-start gap-2 px-2 font-normal text-sm ${
                activePage === page.id
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              }`}
              onClick={() => setActivePage(page.id)}
              variant="ghost"
            >
              <span className="text-base">{page.icon}</span>
              <span className="flex-1 truncate">{page.title}</span>
            </Button>
            {hoveredPage === page.id && (
              <div className="absolute right-1 flex">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="h-6 w-6" size="icon" variant="ghost">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="h-6 w-6" size="icon" variant="ghost">
                      <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>More</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <Separator />
      <div className="p-2">
        <Button
          className="h-8 w-full justify-start gap-2 text-muted-foreground text-sm"
          variant="ghost"
        >
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </div>
    </aside>
  );
}
