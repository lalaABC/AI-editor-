'use client';

import { insertInlineEquation } from '@platejs/math';
import { RadicalIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';
import type * as React from 'react';

import { ToolbarButton } from './toolbar';

export function InlineEquationToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        insertInlineEquation(editor);
      }}
      tooltip="标记为公式"
    >
      <RadicalIcon />
    </ToolbarButton>
  );
}
