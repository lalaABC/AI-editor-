'use client';

import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Clock, History, RotateCcw, Save, SaveAll, Trash2 } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { PageVersion } from '@/lib/api/pages';
import { usePageStore } from '@/lib/store/page-store';

type VersionHistoryProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function VersionHistory({ open, onOpenChange }: VersionHistoryProps) {
  const activePageId = usePageStore((s) => s.activePageId);
  const versions = usePageStore((s) => s.versions);
  const versionsLoading = usePageStore((s) => s.versionsLoading);
  const fetchVersions = usePageStore((s) => s.fetchVersions);
  const restoreVersion = usePageStore((s) => s.restoreVersion);
  const deleteVersion = usePageStore((s) => s.deleteVersion);

  // 预览状态
  const [previewVersion, setPreviewVersion] =
    React.useState<PageVersion | null>(null);
  const [confirmRestore, setConfirmRestore] = React.useState<string | null>(
    null
  );

  // 打开面板时加载版本列表
  React.useEffect(() => {
    if (open && activePageId) {
      fetchVersions(activePageId);
    }
  }, [open, activePageId, fetchVersions]);

  const handleRestore = async (versionId: string) => {
    await restoreVersion(versionId);
    setConfirmRestore(null);
    // 刷新版本列表
    if (activePageId) fetchVersions(activePageId);
  };

  const handleDelete = async (versionId: string) => {
    await deleteVersion(versionId);
  };

  return (
    <>
      <Sheet onOpenChange={onOpenChange} open={open}>
        <SheetContent className="w-[380px] sm:w-[440px]" side="right">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              版本历史
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4 flex-1">
            {versionsLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                加载中...
              </div>
            ) : versions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground text-sm">
                <Clock className="h-8 w-8 opacity-50" />
                <p>暂无版本记录</p>
                <p className="text-xs">按 ⌘+S 保存或等待自动保存创建版本</p>
              </div>
            ) : (
              <div className="h-[calc(100vh-140px)] overflow-y-auto pr-3">
                {versions.map((version) => (
                  <VersionItem
                    confirmRestore={confirmRestore}
                    key={version.id}
                    onDelete={handleDelete}
                    onPreview={setPreviewVersion}
                    onRestore={handleRestore}
                    onRestoreConfirm={setConfirmRestore}
                    version={version}
                  />
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* 版本预览弹窗 */}
      <Dialog
        onOpenChange={(v) => !v && setPreviewVersion(null)}
        open={!!previewVersion}
      >
        <DialogContent className="max-h-[80vh] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SaveAll className="h-4 w-4" />
              {previewVersion?.title ?? '版本预览'}
            </DialogTitle>
            <DialogDescription>
              {previewVersion ? formatTime(previewVersion.createdAt) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ContentPreview content={previewVersion?.content} />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (previewVersion) {
                  setConfirmRestore(previewVersion.id);
                  setPreviewVersion(null);
                }
              }}
              variant="default"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              恢复此版本
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 恢复确认弹窗 */}
      <Dialog
        onOpenChange={(v) => !v && setConfirmRestore(null)}
        open={!!confirmRestore}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认恢复版本</DialogTitle>
            <DialogDescription>
              恢复后将自动保存当前内容为一个新版本，你可以随时再恢复回来。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConfirmRestore(null)} variant="outline">
              取消
            </Button>
            <Button
              onClick={() => confirmRestore && handleRestore(confirmRestore)}
              variant="default"
            >
              确认恢复
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================================
// Sub-components
// ============================================================

type VersionItemProps = {
  version: PageVersion;
  onPreview: (v: PageVersion) => void;
  onRestoreConfirm: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
};

function VersionItem({
  version,
  onPreview,
  onRestoreConfirm,
  onDelete,
}: VersionItemProps) {
  return (
    <div className="group flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-accent/50">
      <div className="mt-0.5 shrink-0">
        {version.source === 'manual' ? (
          <Save className="h-4 w-4 text-blue-500" />
        ) : (
          <Clock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium text-sm">{version.title}</span>
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 font-medium text-[10px] ${
              version.source === 'manual'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {version.source === 'manual' ? '手动保存' : '自动保存'}
          </span>
        </div>
        <p className="mt-0.5 text-muted-foreground text-xs">
          {formatTime(version.createdAt)}
        </p>
        <div className="mt-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            className="h-6 gap-1 px-2 text-xs"
            onClick={() => onPreview(version)}
            size="sm"
            variant="ghost"
          >
            查看
          </Button>
          <Button
            className="h-6 gap-1 px-2 text-xs"
            onClick={() => onRestoreConfirm(version.id)}
            size="sm"
            variant="ghost"
          >
            <RotateCcw className="h-3 w-3" />
            恢复
          </Button>
          <Button
            className="h-6 gap-1 px-2 text-destructive text-xs hover:text-destructive"
            onClick={() => onDelete(version.id)}
            size="sm"
            variant="ghost"
          >
            <Trash2 className="h-3 w-3" />
            删除
          </Button>
        </div>
      </div>
    </div>
  );
}

/** 内容预览 — 将 Slate value 渲染为纯文本摘要 */
function ContentPreview({ content }: { content?: unknown[] }) {
  if (!content || !Array.isArray(content)) {
    return <p className="text-muted-foreground">（空内容）</p>;
  }

  const extractText = (nodes: unknown[]): string => {
    let text = '';
    for (const node of nodes) {
      if (!node || typeof node !== 'object') continue;
      const n = node as Record<string, unknown>;
      if (typeof n.text === 'string') {
        text += n.text;
      }
      if (Array.isArray(n.children)) {
        text += `${extractText(n.children)}\n`;
      }
    }
    return text;
  };

  const plainText = extractText(content).trim();

  if (!plainText) {
    return <p className="text-muted-foreground">（空内容）</p>;
  }

  return (
    <div className="whitespace-pre-wrap text-sm leading-relaxed">
      {plainText}
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

function formatTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: zhCN,
    });
  } catch {
    return dateStr;
  }
}
