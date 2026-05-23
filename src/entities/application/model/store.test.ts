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
});

describe('selectCompletedCount', () => {
  it('counts only completed applications', () => {
    useApplicationStore.setState({
      applications: [makeApp('1', 'text'), makeApp('2', null), makeApp('3', 'text')],
    });
    expect(selectCompletedCount(useApplicationStore.getState())).toBe(2);
  });
});

describe('markApplicationPending', () => {
  it('adds a new pending application', () => {
    useApplicationStore.getState().markApplicationPending(makeApp('1', null));
    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', null)]);
    expect(getPersistedApplications()).toHaveLength(0);
  });

  it('resets an existing application to pending and removes it from localStorage', () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'content')] });
    expect(getPersistedApplications()).toHaveLength(1);

    useApplicationStore.getState().markApplicationPending(makeApp('1', null));

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', null)]);
    expect(selectHasPending(useApplicationStore.getState())).toBe(true);
    expect(getPersistedApplications()).toHaveLength(0);
  });
});

describe('removeApplication', () => {
  it('removes the application from the store and localStorage', () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'content'), makeApp('2')] });
    expect(getPersistedApplications()).toHaveLength(2);

    useApplicationStore.getState().removeApplication('1');

    expect(useApplicationStore.getState().applications.map((a) => a.id)).toEqual(['2']);
    expect(getPersistedApplications()).toHaveLength(1);
  });
});

describe('updateApplication', () => {
  it('updates an existing application and persists it', () => {
    useApplicationStore.setState({ applications: [makeApp('1', null)] });

    useApplicationStore.getState().updateApplication(makeApp('1', 'generated letter content'));

    expect(useApplicationStore.getState().applications[0].application).toBe(
      'generated letter content',
    );
    expect(getPersistedApplications()).toEqual([
      expect.objectContaining({ id: '1', application: 'generated letter content' }),
    ]);
  });

  it('inserts a completed application when it is missing in memory', () => {
    useApplicationStore.setState({ applications: [] });

    useApplicationStore.getState().updateApplication(makeApp('1', 'new content'));

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', 'new content')]);
  });
});

describe('rehydrate merge', () => {
  it('preserves in-memory pending applications during rehydrate', async () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'content')] });
    useApplicationStore.getState().markApplicationPending(makeApp('1', null));

    await useApplicationStore.persist.rehydrate();

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', null)]);
    expect(selectHasPending(useApplicationStore.getState())).toBe(true);
  });
});

describe('legacy localStorage format', () => {
  it('migrates a raw Application[] payload on read', async () => {
    localStorage.setItem(
      APPLICATIONS_STORAGE_KEY,
      JSON.stringify([makeApp('1', 'content'), makeApp('2', null)]),
    );

    await useApplicationStore.persist.rehydrate();

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', 'content')]);
  });
});
