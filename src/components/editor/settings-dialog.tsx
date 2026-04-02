'use client';

/* DEMO ONLY, DO NOT USE IN PRODUCTION */

import { CopilotPlugin } from '@platejs/ai/react';
import {
  Check,
  ChevronsUpDown,
  ExternalLinkIcon,
  Eye,
  EyeOff,
  Settings,
  Wand2Icon,
} from 'lucide-react';
import { useEditorRef } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { aiChatPlugin } from './plugins/ai-kit';

type Model = {
  label: string;
  value: string;
};

type Provider = 'openai' | 'anthropic' | 'google';

type ProviderConfig = {
  id: Provider;
  label: string;
  models: Model[];
  defaultModel: string;
  apiKeyUrl: string;
};

const providers: ProviderConfig[] = [
  {
    id: 'openai',
    label: 'OpenAI',
    models: [
      { label: 'GPT-4o', value: 'gpt-4o' },
      { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
      { label: 'GPT-4.1', value: 'gpt-4.1' },
      { label: 'GPT-4.1 Mini', value: 'gpt-4.1-mini' },
      { label: 'O3 Mini', value: 'o3-mini' },
      { label: 'O1', value: 'o1' },
    ],
    defaultModel: 'gpt-4o-mini',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    models: [
      { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
      { label: 'Claude 3.5 Haiku', value: 'claude-3-5-haiku-20241022' },
      { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
    ],
    defaultModel: 'claude-3-5-sonnet-20241022',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'google',
    label: 'Google',
    models: [
      { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
      { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
      { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
    ],
    defaultModel: 'gemini-2.5-flash',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
  },
];

type Config = {
  provider: Provider;
  model: string;
};

type ApiKeys = {
  openai: string;
  anthropic: string;
  google: string;
};

const STORAGE_KEY_CONFIG = 'ai-editor-config';
const STORAGE_KEY_KEYS = 'ai-editor-apikeys';

function loadConfig(): Config {
  if (typeof window === 'undefined')
    return { provider: 'openai', model: 'gpt-4o-mini' };
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
    return stored
      ? JSON.parse(stored)
      : { provider: 'openai', model: 'gpt-4o-mini' };
  } catch {
    return { provider: 'openai', model: 'gpt-4o-mini' };
  }
}

function saveConfig(config: Config) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }
}

function loadApiKeys(): ApiKeys {
  if (typeof window === 'undefined')
    return { openai: '', anthropic: '', google: '' };
  try {
    const stored = localStorage.getItem(STORAGE_KEY_KEYS);
    return stored
      ? JSON.parse(stored)
      : { openai: '', anthropic: '', google: '' };
  } catch {
    return { openai: '', anthropic: '', google: '' };
  }
}

function saveApiKeys(keys: ApiKeys) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_KEYS, JSON.stringify(keys));
  }
}

export function SettingsDialog() {
  const editor = useEditorRef();

  const [config, setConfig] = React.useState<Config>(() => loadConfig());
  const [apiKeys, setApiKeys] = React.useState<ApiKeys>(() => loadApiKeys());
  const [showKey, setShowKey] = React.useState<Record<Provider, boolean>>({
    openai: false,
    anthropic: false,
    google: false,
  });
  const [open, setOpen] = React.useState(false);
  const [openModel, setOpenModel] = React.useState(false);

  const currentProvider = providers.find((p) => p.id === config.provider)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    saveConfig(config);
    saveApiKeys(apiKeys);

    // Update AI chat options
    const chatOptions = editor.getOptions(aiChatPlugin).chatOptions ?? {};

    editor.setOption(aiChatPlugin, 'chatOptions', {
      ...chatOptions,
      body: {
        ...chatOptions.body,
        apiKey: apiKeys[config.provider],
        model: config.model,
        provider: config.provider,
      },
    });

    setOpen(false);

    // Update AI complete options
    const completeOptions =
      editor.getOptions(CopilotPlugin).completeOptions ?? {};
    editor.setOption(CopilotPlugin, 'completeOptions', {
      ...completeOptions,
      body: {
        ...completeOptions.body,
        apiKey: apiKeys[config.provider],
        model: config.model,
        provider: config.provider,
      },
    });
  };

  const toggleKeyVisibility = (provider: Provider) => {
    setShowKey((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const renderApiKeyInput = (provider: Provider) => (
    <div className="group relative" key={provider}>
      <div className="flex items-center justify-between">
        <label
          className="absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-muted-foreground/70 text-sm transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:font-medium group-focus-within:text-foreground group-focus-within:text-xs has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground has-[+input:not(:placeholder-shown)]:text-xs"
          htmlFor={`${provider}-key`}
        >
          <span className="inline-flex bg-background px-2">
            {providers.find((p) => p.id === provider)!.label} API Key
          </span>
        </label>
        <Button
          asChild
          className="absolute top-0 right-[28px] h-full"
          size="icon"
          variant="ghost"
        >
          <a
            className="flex items-center"
            href={providers.find((p) => p.id === provider)!.apiKeyUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLinkIcon className="size-4" />
            <span className="sr-only">获取 API 密钥</span>
          </a>
        </Button>
      </div>

      <Input
        className="pr-10"
        data-1p-ignore
        id={`${provider}-key`}
        onChange={(e) =>
          setApiKeys((prev) => ({ ...prev, [provider]: e.target.value }))
        }
        placeholder=""
        type={showKey[provider] ? 'text' : 'password'}
        value={apiKeys[provider]}
      />
      <Button
        className="absolute top-0 right-0 h-full"
        onClick={() => toggleKeyVisibility(provider)}
        size="icon"
        type="button"
        variant="ghost"
      >
        {showKey[provider] ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
        <span className="sr-only">
          {showKey[provider] ? '隐藏' : '显示'} API 密钥
        </span>
      </Button>
    </div>
  );

  const selectedModel =
    currentProvider.models.find((m) => m.value === config.model) ||
    currentProvider.models[0];

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            'group fixed right-4 bottom-4 z-50 size-10 overflow-hidden',
            'rounded-full shadow-md hover:shadow-lg'
          )}
          size="icon"
          variant="default"
        >
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl">设置</DialogTitle>
          <DialogDescription>配置你的 AI 服务商和偏好设置。</DialogDescription>
        </DialogHeader>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* AI Settings Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                <Wand2Icon className="size-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold">AI 服务商</h4>
            </div>

            {/* Provider Selection */}
            <div className="flex gap-2">
              {providers.map((provider) => (
                <Button
                  className="flex-1"
                  key={provider.id}
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      provider: provider.id,
                      model: provider.defaultModel,
                    }))
                  }
                  size="sm"
                  type="button"
                  variant={
                    config.provider === provider.id ? 'default' : 'outline'
                  }
                >
                  {provider.label}
                </Button>
              ))}
            </div>

            {/* API Key Input for selected provider */}
            <div className="space-y-4">
              {renderApiKeyInput(config.provider)}

              {/* Model Selection */}
              <div className="group relative">
                <label
                  className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 font-medium text-foreground text-xs group-has-disabled:opacity-50"
                  htmlFor="select-model"
                >
                  模型
                </label>
                <Popover onOpenChange={setOpenModel} open={openModel}>
                  <PopoverTrigger asChild id="select-model">
                    <Button
                      aria-expanded={openModel}
                      className="w-full justify-between"
                      role="combobox"
                      size="lg"
                      variant="outline"
                    >
                      <code>{selectedModel.label}</code>
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="搜索模型..." />
                      <CommandEmpty>未找到模型。</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {currentProvider.models.map((m) => (
                            <CommandItem
                              key={m.value}
                              onSelect={() => {
                                setConfig((prev) => ({
                                  ...prev,
                                  model: m.value,
                                }));
                                setOpenModel(false);
                              }}
                              value={m.value}
                            >
                              <Check
                                className={cn(
                                  'mr-2 size-4',
                                  config.model === m.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <code>{m.label}</code>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <Button className="w-full" size="lg" type="submit">
            保存更改
          </Button>
        </form>

        <p className="text-muted-foreground text-sm">
          API 密钥存储在浏览器的 localStorage 中。
        </p>
      </DialogContent>
    </Dialog>
  );
}
