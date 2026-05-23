import { beforeEach, describe, expect, it } from 'vitest';

import {
  APPLICATIONS_STORAGE_KEY,
  selectCompletedCount,
  selectHasPending,
  useApplicationStore,
} from './store';
import type { Application } from './types';

const makeApp = (id: string, content: string | null = 'letter'): Application => ({
  id,
  jobTitle: 'Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript React',
  additionalDetails: 'Details',
  application: content,
});

function getPersistedApplications(): Application[] {
  const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw) as { state?: { applications?: Application[] } };
  return parsed.state?.applications ?? [];
}

beforeEach(() => {
  localStorage.clear();
  useApplicationStore.setState({ applications: [] });
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

describe('markApplicationPending', () => {
  it('adds a new pending application', () => {
    useApplicationStore.getState().markApplicationPending(makeApp('1', null));
    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', null)]);
  });

  it('resets an existing application to pending', () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'content')] });

    useApplicationStore.getState().markApplicationPending(makeApp('1', null));

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', null)]);
    expect(getPersistedApplications()).toHaveLength(0);
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

  it('removes completed application from localStorage', () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'content')] });
    expect(getPersistedApplications()).toHaveLength(1);

    useApplicationStore.getState().removeApplication('1');
    expect(getPersistedApplications()).toHaveLength(0);
  });
});

describe('updateApplication', () => {
  it('updates an existing application in the store', () => {
    useApplicationStore.setState({ applications: [makeApp('1', null)] });
    const updated = makeApp('1', 'generated letter content');
    useApplicationStore.getState().updateApplication(updated);
    expect(useApplicationStore.getState().applications[0].application).toBe(
      'generated letter content',
    );
  });

  it('persists completed applications to localStorage', () => {
    useApplicationStore.setState({ applications: [makeApp('1', null)] });
    useApplicationStore.getState().updateApplication(makeApp('1', 'content'));
    expect(getPersistedApplications()).toEqual([
      expect.objectContaining({ id: '1', application: 'content' }),
    ]);
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

  it('removes application from localStorage', () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'content')] });
    expect(getPersistedApplications()).toHaveLength(1);

    useApplicationStore.getState().resetApplicationToPending('1');
    expect(getPersistedApplications()).toHaveLength(0);
  });
});

describe('persist partialize', () => {
  it('does not persist pending applications', () => {
    useApplicationStore.getState().addApplication(makeApp('1', null));
    expect(getPersistedApplications()).toHaveLength(0);
  });
});

describe('regeneration', () => {
  it('keeps pending application in memory after resetApplicationToPending', () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'content')] });

    useApplicationStore.getState().resetApplicationToPending('1');

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', null)]);
    expect(selectHasPending(useApplicationStore.getState())).toBe(true);
    expect(getPersistedApplications()).toHaveLength(0);
  });

  it('preserves pending application during rehydrate after regeneration starts', async () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'content')] });
    useApplicationStore.getState().resetApplicationToPending('1');

    await useApplicationStore.persist.rehydrate();

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', null)]);
    expect(selectHasPending(useApplicationStore.getState())).toBe(true);
  });

  it('restores completed application after successful regeneration', () => {
    useApplicationStore.setState({ applications: [makeApp('1', null)] });

    useApplicationStore.getState().updateApplication(makeApp('1', 'new content'));

    expect(useApplicationStore.getState().applications[0].application).toBe('new content');
    expect(getPersistedApplications()[0]?.application).toBe('new content');
  });

  it('adds completed application on update when it was removed from memory', () => {
    useApplicationStore.setState({ applications: [] });

    useApplicationStore.getState().updateApplication(makeApp('1', 'new content'));

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', 'new content')]);
  });
});
