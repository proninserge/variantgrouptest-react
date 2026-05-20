import type { GenerateApplicationFormValues } from '../model/types';

export async function generateApplication(
  values: GenerateApplicationFormValues,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
    signal,
  });

  if (!response.ok) {
    const { error } = (await response.json()) as { error?: string };
    throw new Error(error ?? `Request failed: ${String(response.status)}`);
  }

  const { content } = (await response.json()) as { content: string };
  return content;
}
