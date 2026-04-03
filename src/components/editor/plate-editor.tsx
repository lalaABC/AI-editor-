'use client';

import { normalizeStaticValue } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';
import * as React from 'react';

import { EditorKit } from '@/components/editor/editor-kit';
import { SettingsDialog } from '@/components/editor/settings-dialog';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { usePageStore } from '@/lib/store/page-store';

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

  const handleChange = React.useCallback(
    ({ value }: { value: any[] }) => {
      if (activePage) {
        updatePage(activePage.id, { content: value });
      }
    },
    [activePage, updatePage]
  );

  return (
    <Plate editor={editor} onChange={handleChange}>
      <EditorContainer>
        <Editor />
      </EditorContainer>
      <SettingsDialog />
    </Plate>
  );
}
