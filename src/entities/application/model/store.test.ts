import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock storage to keep tests isolated from localStorage side effects
vi.mock('../lib/storage', () => ({
  applicationStorage: {
    getAll: vi.fn(() => []),
    save: vi.fn(),
    remove: vi.fn(),
  },
}));

import { applicationStorage } from '../lib/storage';
import { selectCompletedCount, selectHasPending, useApplicationStore } from './store';
import type { Application } from './types';

const makeApp = (id: string, content: string | null = 'letter'): Application => ({
  id,
  jobTitle: 'Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript React',
  additionalDetails: 'Details',
  application: content,
});

beforeEach(() => {
  useApplicationStore.setState({ applications: [] });
  vi.clearAllMocks();
});

describe('selectHasPending', () => {
  it('returns false when the list is empty', () => {
    expect(selectHasPending(useApplicationStore.getState())).toBe(false);
  });

  it('returns true when at least one application has application === null', () => {
    useApplicationStore.setState({ applications: [makeApp('1', null)] });
    expect(selectHasPending(useApplicationStore.getState())).toBe(true);
  });

  it('returns false when all applications are completed', () => {
    useApplicationStore.setState({
      applications: [makeApp('1', 'text'), makeApp('2', 'text')],
    });
    expect(selectHasPending(useApplicationStore.getState())).toBe(false);
  });

  it('returns true when mixed completed and pending', () => {
    useApplicationStore.setState({
      applications: [makeApp('1', 'text'), makeApp('2', null)],
    });
    expect(selectHasPending(useApplicationStore.getState())).toBe(true);
  });
});

describe('selectCompletedCount', () => {
  it('returns 0 for an empty list', () => {
    expect(selectCompletedCount(useApplicationStore.getState())).toBe(0);
  });

  it('counts only applications with a non-null application field', () => {
    useApplicationStore.setState({
      applications: [makeApp('1', 'text'), makeApp('2', null), makeApp('3', 'text')],
    });
    expect(selectCompletedCount(useApplicationStore.getState())).toBe(2);
  });

  it('returns 0 when all are pending', () => {
    useApplicationStore.setState({
      applications: [makeApp('1', null), makeApp('2', null)],
    });
    expect(selectCompletedCount(useApplicationStore.getState())).toBe(0);
  });
});

describe('addApplication', () => {
  it('adds an application to the store', () => {
    useApplicationStore.getState().addApplication(makeApp('1'));
    expect(useApplicationStore.getState().applications).toHaveLength(1);
  });

  it('is idempotent — does not add duplicates with the same id', () => {
    useApplicationStore.getState().addApplication(makeApp('1'));
    useApplicationStore.getState().addApplication(makeApp('1'));
    expect(useApplicationStore.getState().applications).toHaveLength(1);
  });
});

describe('removeApplication', () => {
  it('removes the application from the store', () => {
    useApplicationStore.setState({ applications: [makeApp('1'), makeApp('2')] });
    useApplicationStore.getState().removeApplication('1');
    const ids = useApplicationStore.getState().applications.map((a) => a.id);
    expect(ids).toEqual(['2']);
  });

  it('calls applicationStorage.remove', () => {
    useApplicationStore.setState({ applications: [makeApp('1')] });
    useApplicationStore.getState().removeApplication('1');
    expect(applicationStorage.remove).toHaveBeenCalledWith('1', expect.any(Array));
  });
});

describe('persistApplication', () => {
  it('updates an existing application in the store', () => {
    useApplicationStore.setState({ applications: [makeApp('1', null)] });
    const updated = makeApp('1', 'generated letter content');
    useApplicationStore.getState().persistApplication(updated);
    expect(useApplicationStore.getState().applications[0].application).toBe(
      'generated letter content',
    );
  });

  it('calls applicationStorage.save', () => {
    useApplicationStore.setState({ applications: [makeApp('1', null)] });
    useApplicationStore.getState().persistApplication(makeApp('1', 'content'));
    expect(applicationStorage.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1' }),
      expect.any(Array),
    );
  });
});

describe('dropApplication', () => {
  it('removes from the store without touching storage', () => {
    useApplicationStore.setState({ applications: [makeApp('1'), makeApp('2')] });
    useApplicationStore.getState().dropApplication('1');
    expect(useApplicationStore.getState().applications.map((a) => a.id)).toEqual(['2']);
    expect(applicationStorage.remove).not.toHaveBeenCalled();
  });
});

describe('resetApplicationToPending', () => {
  it('sets application field to null for the given id', () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'content')] });
    useApplicationStore.getState().resetApplicationToPending('1');
    expect(useApplicationStore.getState().applications[0].application).toBeNull();
  });

  it('does not affect other applications', () => {
    useApplicationStore.setState({
      applications: [makeApp('1', 'content'), makeApp('2', 'content')],
    });
    useApplicationStore.getState().resetApplicationToPending('1');
    expect(useApplicationStore.getState().applications[1].application).toBe('content');
  });
});
