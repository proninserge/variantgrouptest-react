import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

vi.mock('@/features/generate-application/api/generateApplication', () => ({
  generateApplication: vi.fn(),
}));

vi.mock('@/entities/application/lib/channel', () => ({
  postPending: vi.fn(),
  postResolved: vi.fn(),
  postCancelled: vi.fn(),
  postDeleted: vi.fn(),
}));

vi.mock('./useBeforeUnloadGenerationCleanup', () => ({
  useBeforeUnloadGenerationCleanup: vi.fn(),
}));

import { createRouteLoader } from '@/app/providers/router/createLoader';
import {
  APPLICATIONS_STORAGE_KEY,
  selectCompletedCount,
  selectHasGeneratingApplication,
  useApplicationStore,
} from '@/entities/application';
import { postCancelled, postPending, postResolved } from '@/entities/application/lib/channel';
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

function getPersistedApplicationIds(): string[] {
  const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw) as { state?: { applications?: { id: string }[] } };
  return (parsed.state?.applications ?? []).map((application) => application.id);
}

function getStoreState() {
  return useApplicationStore.getState();
}

let randomUuidSpy: MockInstance<typeof crypto.randomUUID>;

beforeEach(() => {
  localStorage.clear();
  useApplicationStore.setState({ applications: [] });
  randomUuidSpy = vi.spyOn(crypto, 'randomUUID').mockReturnValue(APPLICATION_ID);
  vi.mocked(generateApplication).mockResolvedValue('Generated letter');
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('useGenerateApplicationSession integration', () => {
  it('persists a completed application after successful first generation', async () => {
    const { result } = renderSession();

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(getStoreState().applications).toEqual([
      expect.objectContaining({
        id: APPLICATION_ID,
        application: 'Generated letter',
        generationStatus: 'idle',
      }),
    ]);
    expect(selectCompletedCount(getStoreState())).toBe(1);
    expect(selectHasGeneratingApplication(getStoreState())).toBe(false);
    expect(getPersistedApplicationIds()).toEqual([APPLICATION_ID]);
    expect(postResolved).toHaveBeenCalled();
  });

  it('leaves store and localStorage empty after first generation failure', async () => {
    vi.mocked(generateApplication).mockRejectedValue(new Error('Network timeout'));

    const { result } = renderSession();

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(getStoreState().applications).toEqual([]);
    expect(selectCompletedCount(getStoreState())).toBe(0);
    expect(getPersistedApplicationIds()).toEqual([]);
    expect(postCancelled).toHaveBeenCalledWith(APPLICATION_ID);
  });

  it('updates content and keeps the same id after successful regeneration', async () => {
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

    await waitFor(() => {
      expect(result.current.status).toBe('success');
      expect(result.current.generatedContent).toBe('Second letter');
    });

    expect(randomUuidSpy).toHaveBeenCalledTimes(1);
    expect(getStoreState().applications).toEqual([
      expect.objectContaining({
        id: APPLICATION_ID,
        application: 'Second letter',
        generationStatus: 'idle',
      }),
    ]);
    expect(selectCompletedCount(getStoreState())).toBe(1);
    expect(getPersistedApplicationIds()).toEqual([APPLICATION_ID]);
    expect(postPending).toHaveBeenCalledTimes(2);
    expect(postResolved).toHaveBeenCalledTimes(2);
  });

  it('removes completed application from store and localStorage after regeneration failure', async () => {
    vi.mocked(generateApplication)
      .mockResolvedValueOnce('First letter')
      .mockRejectedValueOnce(new Error('OpenAI unavailable'));

    const { result } = renderSession();

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(getPersistedApplicationIds()).toEqual([APPLICATION_ID]);

    act(() => {
      result.current.startGeneration(FORM_VALUES);
    });

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.error).toBe('OpenAI unavailable');
    expect(getStoreState().applications).toEqual([]);
    expect(selectCompletedCount(getStoreState())).toBe(0);
    expect(selectHasGeneratingApplication(getStoreState())).toBe(false);
    expect(getPersistedApplicationIds()).toEqual([]);
    expect(postCancelled).toHaveBeenCalledWith(APPLICATION_ID);
    expect(createRouteLoader()).toBeNull();
  });

  it('keeps completed application in store when regeneration is aborted', async () => {
    vi.mocked(generateApplication)
      .mockResolvedValueOnce('First letter')
      .mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));

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

    await waitFor(() => {
      expect(postPending).toHaveBeenCalledTimes(2);
    });

    expect(getStoreState().applications).toEqual([
      expect.objectContaining({
        id: APPLICATION_ID,
        application: 'First letter',
        generationStatus: 'generating',
      }),
    ]);
    expect(selectCompletedCount(getStoreState())).toBe(1);
    expect(getPersistedApplicationIds()).toEqual([]);
    expect(postCancelled).not.toHaveBeenCalled();
  });

  it('blocks create route while regeneration is in flight', async () => {
    vi.mocked(generateApplication)
      .mockResolvedValueOnce('First letter')
      .mockImplementationOnce(() => new Promise(() => undefined));

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

    await waitFor(() => {
      expect(result.current.status).toBe('generating');
    });

    expect(selectHasGeneratingApplication(getStoreState())).toBe(true);
    expect(selectCompletedCount(getStoreState())).toBe(1);

    const loaderResult = createRouteLoader();
    expect(loaderResult).toBeInstanceOf(Response);
    expect((loaderResult as Response).status).toBe(302);
  });

  it('preserves old content in store while regeneration is pending', async () => {
    vi.mocked(generateApplication)
      .mockResolvedValueOnce('First letter')
      .mockImplementationOnce(() => new Promise(() => undefined));

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

    await waitFor(() => {
      expect(result.current.status).toBe('generating');
    });

    expect(getStoreState().applications).toEqual([
      expect.objectContaining({
        id: APPLICATION_ID,
        application: 'First letter',
        generationStatus: 'generating',
      }),
    ]);
    expect(getPersistedApplicationIds()).toEqual([]);
  });
});
