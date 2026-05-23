import type { GenerationStatus } from './types';

export function getGenerationStatus(
  isPending: boolean,
  isSuccess: boolean,
  isError: boolean,
): GenerationStatus {
  if (isPending) return 'generating';
  if (isSuccess) return 'success';
  if (isError) return 'error';
  return 'idle';
}

export function getGenerationErrorMessage(error: Error | null): string | null {
  if (!error) return null;
  return error.message || 'Generation failed';
}
