'use client';

import * as React from 'react';

import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Sidebar } from '@/components/layout/sidebar';

type EditorLayoutProps = {
  children: React.ReactNode;
};

export function EditorLayout({ children }: EditorLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Breadcrumb Bar */}
        <Breadcrumb
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
