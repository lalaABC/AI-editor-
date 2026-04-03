'use client';

import { normalizeStaticValue } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import * as React from 'react';

import { EditorKit } from '@/components/editor/editor-kit';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { usePageStore } from '@/lib/store/page-store';

/** 防抖保存延迟（ms��� */
const SAVE_DEBOUNCE_MS = 2000;
/** 定时自动版本间隔（ms） — 5 分钟 */
const AUTO_VERSION_INTERVAL_MS = 5 * 60 * 1000;

const fallbackValue = normalizeStaticValue([
  {
    children: [{ text: '欢迎使用 AI 编辑器' }],
    type: 'h1',
  },
  {
    children: [{ text: '在左侧选择或新建一个页面开始编辑。' }],
    type: 'p',
  },
]);

export function PlateEditor() {
  const activePage = usePageStore((s) =>
    s.activePageId
      ? (s.pages.find((p) => p.id === s.activePageId) ?? null)
      : null
  );
  const updatePage = usePageStore((s) => s.updatePage);
  const createVersion = usePageStore((s) => s.createVersion);

  const initialValue = React.useMemo(
    () =>
      activePage?.content
        ? normalizeStaticValue(activePage.content as any)
        : fallbackValue,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activePage?.id]
  );

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: initialValue,
  });

  // 防抖保存
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = React.useRef<any[]>([]);

  const handleChange = React.useCallback(
    ({ value }: { value: any[] }) => {
      latestContentRef.current = value;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        if (activePage) {
          updatePage(activePage.id, { content: value });
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [activePage, updatePage]
  );

  // ⌘+S 手动保存 + 创建版本
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (!activePage) return;
        // 立即保存当前内容
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        updatePage(activePage.id, { content: latestContentRef.current });
        // 创建手动版本快照
        createVersion(activePage.id, 'manual');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activePage, updatePage, createVersion]);

  // 定时自动版本（5 分钟）
  React.useEffect(() => {
    if (!activePage) return;
    const timer = setInterval(() => {
      createVersion(activePage.id, 'auto');
    }, AUTO_VERSION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activePage?.id, createVersion]);

  return (
    <Plate editor={editor} onChange={handleChange}>
      <EditorContainer>
        <Editor />
      </EditorContainer>
      <SettingsDialog />
    </Plate>
  );
}
