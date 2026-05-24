import { beforeEach, describe, expect, it, vi } from 'vitest';

const markApplicationGenerating = vi.fn();
const updateApplication = vi.fn();
const removeApplication = vi.fn();

const applications = vi.hoisted((): Application[] => []);

vi.mock('../model/store', () => ({
  useApplicationStore: {
    getState: () => ({
      markApplicationGenerating,
      updateApplication,
      removeApplication,
      applications: applications,
    }),
  },
}));

vi.mock('./channel', () => ({
  postPending: vi.fn(),
  postResolved: vi.fn(),
  postCancelled: vi.fn(),
  postDeleted: vi.fn(),
}));

import type { Application, CompletedApplicationFields } from '../model/types';
import {
  syncApplicationAsCancelled,
  syncApplicationAsDeleted,
  syncApplicationAsGenerating,
  syncApplicationAsResolved,
  syncApplicationGenerationAborted,
} from './applicationSync';
import { postCancelled, postDeleted, postPending, postResolved } from './channel';

const applicationFields: CompletedApplicationFields = {
  id: '1',
  jobTitle: 'Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript',
  additionalDetails: 'Details',
  application: 'letter',
};

const resolvedApplication: Application = {
  ...applicationFields,
  generationStatus: 'idle',
};

const pendingGeneratingApplication: Application = {
  ...applicationFields,
  application: null,
  generationStatus: 'generating',
};

const regeneratingApplication: Application = {
  ...applicationFields,
  generationStatus: 'generating',
};

beforeEach(() => {
  applications.length = 0;
  vi.clearAllMocks();
});

describe('applicationSync', () => {
  it('syncApplicationAsGenerating updates the store and broadcasts the normalized application', () => {
    const generatingFields = { ...applicationFields, application: null };
    markApplicationGenerating.mockImplementation(() => {
      applications.push(pendingGeneratingApplication);
    });

    syncApplicationAsGenerating(generatingFields);

    expect(markApplicationGenerating).toHaveBeenCalledWith(generatingFields);
    expect(postPending).toHaveBeenCalledWith(pendingGeneratingApplication);
  });

  it('syncApplicationAsResolved updates the store and broadcasts the normalized application', () => {
    updateApplication.mockImplementation(() => {
      applications.push(resolvedApplication);
    });

    syncApplicationAsResolved(applicationFields);

    expect(updateApplication).toHaveBeenCalledWith(applicationFields);
    expect(postResolved).toHaveBeenCalledWith(resolvedApplication);
  });

  it('syncApplicationAsCancelled updates the store and notifies other tabs', () => {
    syncApplicationAsCancelled('1');

    expect(removeApplication).toHaveBeenCalledWith('1');
    expect(postCancelled).toHaveBeenCalledWith('1');
  });

  it('syncApplicationAsDeleted updates the store and notifies other tabs', () => {
    syncApplicationAsDeleted('1');

    expect(removeApplication).toHaveBeenCalledWith('1');
    expect(postDeleted).toHaveBeenCalledWith('1');
  });

  it('syncApplicationGenerationAborted removes a pending application', () => {
    applications.push(pendingGeneratingApplication);

    syncApplicationGenerationAborted('1');

    expect(removeApplication).toHaveBeenCalledWith('1');
    expect(postCancelled).toHaveBeenCalledWith('1');
  });

  it('syncApplicationGenerationAborted restores a completed application after aborted regeneration', () => {
    applications.push(regeneratingApplication);
    updateApplication.mockImplementation(() => {
      applications.splice(0, applications.length, resolvedApplication);
    });

    syncApplicationGenerationAborted('1');

    expect(updateApplication).toHaveBeenCalledWith(applicationFields);
    expect(postResolved).toHaveBeenCalledWith(resolvedApplication);
    expect(removeApplication).not.toHaveBeenCalled();
  });
});
