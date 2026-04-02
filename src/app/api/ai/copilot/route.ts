import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const getProviderModel = (
  provider: string,
  apiKey: string,
  modelId: string
) => {
  switch (provider) {
    case 'anthropic':
      return createAnthropic({ apiKey })(modelId);
    case 'google':
      return createGoogleGenerativeAI({ apiKey })(modelId);
    default:
      return createOpenAI({ apiKey })(modelId);
  }
};

export async function POST(req: NextRequest) {
  const {
    apiKey: key,
    model = 'gpt-4o-mini',
    provider = 'openai',
    prompt,
    system,
  } = await req.json();
  const apiKey = key || process.env[`${provider.toUpperCase()}_API_KEY`];
  if (!apiKey)
    return NextResponse.json(
      { error: `缺少 ${provider.toUpperCase()} API Key` },
      { status: 401 }
    );
  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxOutputTokens: 50,
      model: getProviderModel(provider, apiKey, model),
      prompt,
      system,
      temperature: 0.7,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError')
      return NextResponse.json(null, { status: 408 });
    return NextResponse.json({ error: 'AI 请求处理失败' }, { status: 500 });
  }
}
