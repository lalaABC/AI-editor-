'use client';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import {
  CalendarIcon,
  ChevronRightIcon,
  Code2,
  Columns3Icon,
  FileCodeIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PenToolIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  RadicalIcon,
  SquareIcon,
  TableIcon,
  TableOfContentsIcon,
} from 'lucide-react';
import { KEYS } from 'platejs';
import { type PlateEditor, useEditorRef } from 'platejs/react';
import * as React from 'react';
import {
  insertBlock,
  insertInlineElement,
} from '@/components/editor/transforms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ToolbarButton, ToolbarMenuGroup } from './toolbar';

type Group = {
  group: string;
  items: Item[];
};

type Item = {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  focusEditor?: boolean;
  label?: string;
};

const groups: Group[] = [
  {
    group: '基础块',
    items: [
      {
        icon: <PilcrowIcon />,
        label: '段落',
        value: KEYS.p,
      },
      {
        icon: <Heading1Icon />,
        label: '标题 1',
        value: 'h1',
      },
      {
        icon: <Heading2Icon />,
        label: '标题 2',
        value: 'h2',
      },
      {
        icon: <Heading3Icon />,
        label: '标题 3',
        value: 'h3',
      },
      {
        icon: <TableIcon />,
        label: '表格',
        value: KEYS.table,
      },
      {
        icon: <FileCodeIcon />,
        label: '代码',
        value: KEYS.codeBlock,
      },
      {
        icon: <QuoteIcon />,
        label: '引用',
        value: KEYS.blockquote,
      },
      {
        icon: <MinusIcon />,
        label: '分隔线',
        value: KEYS.hr,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: '列表',
    items: [
      {
        icon: <ListIcon />,
        label: '无序列表',
        value: KEYS.ul,
      },
      {
        icon: <ListOrderedIcon />,
        label: '有序列表',
        value: KEYS.ol,
      },
      {
        icon: <SquareIcon />,
        label: '待办列表',
        value: KEYS.listTodo,
      },
      {
        icon: <ChevronRightIcon />,
        label: '折叠列表',
        value: KEYS.toggle,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: '媒体',
    items: [
      {
        icon: <ImageIcon />,
        label: '图片',
        value: KEYS.img,
      },
      {
        icon: <FilmIcon />,
        label: '嵌入',
        value: KEYS.mediaEmbed,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: '高级块',
    items: [
      {
        icon: <TableOfContentsIcon />,
        label: '目录',
        value: KEYS.toc,
      },
      {
        icon: <Columns3Icon />,
        label: '三栏布局',
        value: 'action_three_columns',
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: '公式',
        value: KEYS.equation,
      },
      {
        icon: <PenToolIcon />,
        label: '画板',
        value: KEYS.excalidraw,
      },
      {
        icon: <Code2 />,
        label: '代码绘图',
        value: KEYS.codeDrawing,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: '行内元素',
    items: [
      {
        icon: <Link2Icon />,
        label: '链接',
        value: KEYS.link,
      },
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        label: '日期',
        value: KEYS.date,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: '行内公式',
        value: KEYS.inlineEquation,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function InsertToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu modal={false} onOpenChange={setOpen} open={open} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton isDropdown pressed={open} tooltip="插入">
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto"
      >
        {groups.map(({ group, items: nestedItems }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                className="min-w-[180px]"
                key={value}
                onSelect={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                }}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </ToolbarMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
