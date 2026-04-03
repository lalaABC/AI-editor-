'use client';

import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';

import { EditorLayout } from '@/components/layout/editor-layout';

const PlateEditor = dynamic(
  () => import('@/components/editor/plate-editor').then((m) => m.PlateEditor),
  { ssr: false }
);

export default function Home() {
  return (
    <EditorLayout>
      <PlateEditor />
      <Toaster />
    </EditorLayout>
  );
}
