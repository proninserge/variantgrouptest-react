import { beforeEach, describe, expect, it, vi } from 'vitest';

const markApplicationPending = vi.fn();
const updateApplication = vi.fn();
const removeApplication = vi.fn();

vi.mock('../model/store', () => ({
  useApplicationStore: {
    getState: () => ({
      markApplicationPending,
      updateApplication,
      removeApplication,
    }),
  },
}));

vi.mock('./channel', () => ({
  postPending: vi.fn(),
  postResolved: vi.fn(),
  postCancelled: vi.fn(),
}));

import type { Application } from '../model/types';
import {
  syncApplicationAsCancelled,
  syncApplicationAsPending,
  syncApplicationAsResolved,
} from './applicationSync';
import { postCancelled, postPending, postResolved } from './channel';

const application: Application = {
  id: '1',
  jobTitle: 'Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript',
  additionalDetails: 'Details',
  application: 'letter',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('applicationSync', () => {
  it('syncApplicationAsPending updates the store and notifies other tabs', () => {
    const pending = { ...application, application: null };

    syncApplicationAsPending(pending);

    expect(markApplicationPending).toHaveBeenCalledWith(pending);
    expect(postPending).toHaveBeenCalledWith(pending);
  });

  it('syncApplicationAsResolved updates the store and notifies other tabs', () => {
    syncApplicationAsResolved(application);

    expect(updateApplication).toHaveBeenCalledWith(application);
    expect(postResolved).toHaveBeenCalledWith(application);
  });

  it('syncApplicationAsCancelled updates the store and notifies other tabs', () => {
    syncApplicationAsCancelled('1');

    expect(removeApplication).toHaveBeenCalledWith('1');
    expect(postCancelled).toHaveBeenCalledWith('1');
  });
});
