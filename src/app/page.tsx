'use client';

import { Toaster } from 'sonner';
import { PlateEditor } from '@/components/editor/plate-editor';
import { EditorLayout } from '@/components/layout/editor-layout';

export default function Home() {
  return (
    <EditorLayout>
      <PlateEditor />
      <Toaster />
    </EditorLayout>
  );
}
