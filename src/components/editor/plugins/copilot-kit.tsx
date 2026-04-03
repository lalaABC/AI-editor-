'use client';

import { faker } from '@faker-js/faker';
import { CopilotPlugin } from '@platejs/ai/react';
import { serializeMd, stripMarkdown } from '@platejs/markdown';
import type { TElement } from 'platejs';

import { GhostText } from '@/components/ui/ghost-text';

import { MarkdownKit } from './markdown-kit';

export const CopilotKit = [
  ...MarkdownKit,
  CopilotPlugin.configure(({ api }) => ({
    options: {
      completeOptions: {
        api: '/api/ai/copilot',
        body: {
          system: `你是一个高级 AI 写作助手，类似于 VSCode Copilot，但面向通用文本。你的任务是根据上下文预测并生成下一段文本。

规则：
- 自然地续写文本，直到下一个标点符号（句号、逗号、分号、冒号、问号或感叹号）。
- 保持风格和语调一致。不要重复已有文本。
- 对于不明确的上下文，提供最可能的续写。
- 必要时处理代码片段、列表或结构化文本。
- 不要在回复中包含 """。
- 关键：始终以标点符号结尾。
- 关键：避免开始新的块。不要使用块格式，如 >、#、1.、2.、- 等。建议应与上下文在同一块中继续。
- 如果未提供上下文或无法生成续写，返回 "0"，无需解释。`,
        },
        onError: () => {
          // Mock the API response. Remove it when you implement the route /api/ai/copilot
          api.copilot.setBlockSuggestion({
            text: stripMarkdown(faker.lorem.sentence()),
          });
        },
        onFinish: (_, completion) => {
          if (completion === '0') return;

          api.copilot.setBlockSuggestion({
            text: stripMarkdown(completion),
          });
        },
      },
      debounceDelay: 500,
      renderGhostText: GhostText,
      getPrompt: ({ editor }) => {
        const contextEntry = editor.api.block({ highest: true });

        if (!contextEntry) return '';

        const prompt = serializeMd(editor, {
          value: [contextEntry[0] as TElement],
        });

        return `Continue the text up to the next punctuation mark:
  """
  ${prompt}
  """`;
      },
    },
    shortcuts: {
      accept: {
        keys: 'tab',
      },
      acceptNextWord: {
        keys: 'mod+right',
      },
      reject: {
        keys: 'escape',
      },
      triggerSuggestion: {
        keys: 'ctrl+space',
      },
    },
  })),
];
