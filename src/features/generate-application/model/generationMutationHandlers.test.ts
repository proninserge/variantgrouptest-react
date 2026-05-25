import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/entities/application/lib/applicationSync', () => ({
  syncApplicationAsGenerating: vi.fn(),
  syncApplicationAsResolved: vi.fn(),
  syncApplicationAsCancelled: vi.fn(),
  syncApplicationGenerationAborted: vi.fn(),
}));

import {
  syncApplicationAsCancelled,
  syncApplicationAsGenerating,
  syncApplicationAsResolved,
  syncApplicationGenerationAborted,
} from '@/entities/application/lib/applicationSync';

import { createGenerationMutationHandlers } from './generationMutationHandlers';
import type { GenerateApplicationFormValues } from './types';

const APPLICATION_ID = '00000000-0000-4000-8000-000000000001';

const FORM_VALUES: GenerateApplicationFormValues = {
  jobTitle: 'Frontend Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript React Node.js GraphQL REST APIs Docker',
  additionalDetails: 'Experienced developer with a passion for clean code.',
};

function createRefs(applicationId: string | null = APPLICATION_ID) {
  return {
    applicationIdRef: { current: applicationId },
    abortControllerRef: { current: new AbortController() },
  };
}

describe('createGenerationMutationHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('marks the application as generating on mutate', () => {
    const refs = createRefs();
    const handlers = createGenerationMutationHandlers(refs);

    handlers.onMutate({ values: FORM_VALUES, signal: refs.abortControllerRef.current.signal });

    expect(syncApplicationAsGenerating).toHaveBeenCalledWith({
      id: APPLICATION_ID,
      ...FORM_VALUES,
      application: null,
    });
  });

  it('does not sync on mutate when application id is missing', () => {
    const refs = createRefs(null);
    const handlers = createGenerationMutationHandlers(refs);

    handlers.onMutate({ values: FORM_VALUES, signal: new AbortController().signal });

    expect(syncApplicationAsGenerating).not.toHaveBeenCalled();
  });

  it('resolves the application on success', () => {
    const refs = createRefs();
    const handlers = createGenerationMutationHandlers(refs);

    handlers.onSuccess('Generated letter', {
      values: FORM_VALUES,
      signal: refs.abortControllerRef.current.signal,
    });

    expect(syncApplicationAsResolved).toHaveBeenCalledWith({
      id: APPLICATION_ID,
      ...FORM_VALUES,
      application: 'Generated letter',
    });
  });

  it('cancels the application on a non-abort error', () => {
    const refs = createRefs();
    const handlers = createGenerationMutationHandlers(refs);

    handlers.onError(new Error('Network timeout'), {
      values: FORM_VALUES,
      signal: refs.abortControllerRef.current.signal,
    });

    expect(syncApplicationAsCancelled).toHaveBeenCalledWith(APPLICATION_ID);
    expect(syncApplicationGenerationAborted).not.toHaveBeenCalled();
  });

  it('reverts the application when the active request is aborted', () => {
    const refs = createRefs();
    const handlers = createGenerationMutationHandlers(refs);
    const signal = refs.abortControllerRef.current.signal;

    handlers.onError(new DOMException('Aborted', 'AbortError'), {
      values: FORM_VALUES,
      signal,
    });

    expect(syncApplicationGenerationAborted).toHaveBeenCalledWith(APPLICATION_ID);
    expect(syncApplicationAsCancelled).not.toHaveBeenCalled();
  });

  it('ignores abort errors from a superseded request', () => {
    const refs = createRefs();
    const handlers = createGenerationMutationHandlers(refs);
    const supersededSignal = new AbortController().signal;

    handlers.onError(new DOMException('Aborted', 'AbortError'), {
      values: FORM_VALUES,
      signal: supersededSignal,
    });

    expect(syncApplicationGenerationAborted).not.toHaveBeenCalled();
    expect(syncApplicationAsCancelled).not.toHaveBeenCalled();
  });
});
