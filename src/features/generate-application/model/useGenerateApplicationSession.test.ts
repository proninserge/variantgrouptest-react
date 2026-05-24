import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

vi.mock('@/features/generate-application/api/generateApplication', () => ({
  generateApplication: vi.fn(),
}));

vi.mock('@/entities/application/lib/applicationSync', () => ({
  syncApplicationAsGenerating: vi.fn(),
  syncApplicationAsResolved: vi.fn(),
  syncApplicationAsCancelled: vi.fn(),
}));

vi.mock('./useBeforeUnloadGenerationCleanup', () => ({
  useBeforeUnloadGenerationCleanup: vi.fn(),
}));

import {
  syncApplicationAsCancelled,
  syncApplicationAsGenerating,
  syncApplicationAsResolved,
} from '@/entities/application/lib/applicationSync';
import { generateApplication } from '@/features/generate-application/api/generateApplication';

import type { GenerateApplicationFormValues } from './types';
import { useGenerateApplicationSession } from './useGenerateApplicationSession';

const APPLICATION_ID = '00000000-0000-4000-8000-000000000001';

const FORM_VALUES: GenerateApplicationFormValues = {
  jobTitle: 'Frontend Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript React Node.js GraphQL REST APIs Docker',
  additionalDetails: 'Experienced developer with a passion for clean code.',
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function renderSession() {
  return renderHook(() => useGenerateApplicationSession(), {
    wrapper: createWrapper(),
  });
}

function pendingApplication(values: GenerateApplicationFormValues = FORM_VALUES) {
  return { id: APPLICATION_ID, ...values, application: null };
}

function completedApplication(
  content: string,
  values: GenerateApplicationFormValues = FORM_VALUES,
) {
  return { id: APPLICATION_ID, ...values, application: content };
}

let randomUuidSpy: MockInstance<typeof crypto.randomUUID>;

beforeEach(() => {
  randomUuidSpy = vi.spyOn(crypto, 'randomUUID').mockReturnValue(APPLICATION_ID);
  vi.mocked(generateApplication).mockResolvedValue('Generated letter');
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('useGenerateApplicationSession', () => {
  it('marks a new application as pending when generation starts', () => {
    const { result } = renderSession();

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    expect(syncApplicationAsGenerating).toHaveBeenCalledWith(pendingApplication());
  });

  it('resolves a completed application on success', async () => {
    const { result } = renderSession();

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(syncApplicationAsResolved).toHaveBeenCalledWith(
      completedApplication('Generated letter'),
    );
    expect(result.current.formValues).toEqual(FORM_VALUES);
    expect(result.current.generatedContent).toBe('Generated letter');
    expect(result.current.error).toBeNull();
  });

  it('cancels the application when generation fails', async () => {
    vi.mocked(generateApplication).mockRejectedValue(new Error('Network timeout'));

    const { result } = renderSession();

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(syncApplicationAsCancelled).toHaveBeenCalledWith(APPLICATION_ID);
    expect(result.current.error).toBe('Network timeout');
  });

  it('cancels the application when API returns empty content', async () => {
    vi.mocked(generateApplication).mockResolvedValue('   ');

    const { result } = renderSession();

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(syncApplicationAsCancelled).toHaveBeenCalledWith(APPLICATION_ID);
    expect(result.current.error).toBe('Generated content is empty');
  });

  it('does not cancel the application when the request is aborted', async () => {
    vi.mocked(generateApplication).mockRejectedValue(new DOMException('Aborted', 'AbortError'));

    const { result } = renderSession();

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    await waitFor(() => {
      expect(syncApplicationAsGenerating).toHaveBeenCalled();
    });

    expect(syncApplicationAsCancelled).not.toHaveBeenCalled();
  });

  it('reuses the same application id on Try Again', async () => {
    vi.mocked(generateApplication)
      .mockResolvedValueOnce('First letter')
      .mockResolvedValueOnce('Second letter');

    const { result } = renderSession();

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    expect(randomUuidSpy).toHaveBeenCalledTimes(1);
    expect(syncApplicationAsGenerating).toHaveBeenCalledTimes(2);
    expect(syncApplicationAsGenerating).toHaveBeenLastCalledWith(pendingApplication());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
      expect(result.current.generatedContent).toBe('Second letter');
    });
  });

  it('cancels an in-flight generation on triggerReset', async () => {
    vi.mocked(generateApplication).mockImplementation(() => new Promise(() => undefined));

    const { result } = renderSession();

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('generating');
    });

    act(() => {
      result.current.triggerReset();
    });

    expect(syncApplicationAsCancelled).toHaveBeenCalledWith(APPLICATION_ID);
    expect(result.current.status).toBe('idle');
    expect(result.current.formResetKey).toBe(1);
  });

  it('does not cancel a completed application on triggerReset', async () => {
    const { result } = renderSession();

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    act(() => {
      result.current.triggerReset();
    });

    expect(syncApplicationAsCancelled).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
    expect(result.current.generatedContent).toBeNull();
    expect(result.current.formResetKey).toBe(1);
  });
});
