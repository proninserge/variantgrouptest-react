import { beforeEach, describe, expect, it } from 'vitest';

import {
  APPLICATIONS_STORAGE_KEY,
  selectCompletedCount,
  selectHasGeneratingApplication,
  useApplicationStore,
} from './store';
import type { Application, GenerationStatus, PersistedApplication } from './types';

const makeApp = (
  id: string,
  content: string | null = 'letter',
  generationStatus: GenerationStatus = 'idle',
): Application => ({
  id,
  jobTitle: 'Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript React',
  additionalDetails: 'Details',
  application: content,
  generationStatus,
});

const makeResolvedFields = (id: string, content: string) => ({
  id,
  jobTitle: 'Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript React',
  additionalDetails: 'Details',
  application: content,
});

function getPersistedApplications(): PersistedApplication[] {
  const raw = localStorage.getItem(APPLICATIONS_STORAGE_KEY);
  if (!raw) return [];

  const parsed = JSON.parse(raw) as { state?: { applications?: PersistedApplication[] } };
  return parsed.state?.applications ?? [];
}

beforeEach(() => {
  localStorage.clear();
  useApplicationStore.setState({ applications: [] });
});

describe('selectHasGeneratingApplication', () => {
  it('returns false when the list is empty', () => {
    expect(selectHasGeneratingApplication(useApplicationStore.getState())).toBe(false);
  });

  it('returns true when at least one application is generating without content', () => {
    useApplicationStore.setState({ applications: [makeApp('1', null, 'generating')] });
    expect(selectHasGeneratingApplication(useApplicationStore.getState())).toBe(true);
  });

  it('returns true when at least one application is being regenerated', () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'content', 'generating')] });
    expect(selectHasGeneratingApplication(useApplicationStore.getState())).toBe(true);
  });

  it('returns false when all applications are idle', () => {
    useApplicationStore.setState({
      applications: [makeApp('1', 'text'), makeApp('2', 'text')],
    });
    expect(selectHasGeneratingApplication(useApplicationStore.getState())).toBe(false);
  });
});

describe('selectCompletedCount', () => {
  it('counts only completed applications', () => {
    useApplicationStore.setState({
      applications: [makeApp('1', 'text'), makeApp('2', null, 'generating'), makeApp('3', 'text')],
    });
    expect(selectCompletedCount(useApplicationStore.getState())).toBe(2);
  });

  it('does not drop while a completed application is being regenerated', () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'text')] });

    useApplicationStore.getState().markApplicationGenerating(makeApp('1', null));

    expect(selectCompletedCount(useApplicationStore.getState())).toBe(1);
  });

  it('increments only after a pending application is resolved', () => {
    useApplicationStore.getState().markApplicationGenerating(makeApp('1', null));
    expect(selectCompletedCount(useApplicationStore.getState())).toBe(0);

    useApplicationStore
      .getState()
      .updateApplication(makeResolvedFields('1', 'generated letter content'));
    expect(selectCompletedCount(useApplicationStore.getState())).toBe(1);
  });

  it('does not increment when a pending application is cancelled', () => {
    useApplicationStore.getState().markApplicationGenerating(makeApp('1', null));
    useApplicationStore.getState().removeApplication('1');

    expect(selectCompletedCount(useApplicationStore.getState())).toBe(0);
  });

  it('decrements when a completed application regeneration fails', () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'text')] });
    useApplicationStore.getState().markApplicationGenerating(makeApp('1', null));
    useApplicationStore.getState().removeApplication('1');

    expect(selectCompletedCount(useApplicationStore.getState())).toBe(0);
  });
});

describe('markApplicationGenerating', () => {
  it('adds a new generating application', () => {
    useApplicationStore.getState().markApplicationGenerating(makeApp('1', null));
    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', null, 'generating')]);
    expect(getPersistedApplications()).toHaveLength(0);
  });

  it('keeps completed content when an existing application starts regenerating', () => {
    useApplicationStore.setState({ applications: [makeApp('1', 'content')] });
    expect(getPersistedApplications()).toHaveLength(1);

    useApplicationStore.getState().markApplicationGenerating(makeApp('1', null));

    expect(useApplicationStore.getState().applications).toEqual([
      makeApp('1', 'content', 'generating'),
    ]);
    expect(selectCompletedCount(useApplicationStore.getState())).toBe(1);
    expect(selectHasGeneratingApplication(useApplicationStore.getState())).toBe(true);
    expect(getPersistedApplications()).toHaveLength(0);
  });

  it('keeps an existing generating application out of localStorage', () => {
    useApplicationStore.setState({ applications: [makeApp('1', null, 'generating')] });

    useApplicationStore.getState().markApplicationGenerating(makeApp('1', null));

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', null, 'generating')]);
    expect(selectHasGeneratingApplication(useApplicationStore.getState())).toBe(true);
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
  it('updates an existing application, clears generation status, and persists it', () => {
    useApplicationStore.setState({ applications: [makeApp('1', null, 'generating')] });

    useApplicationStore
      .getState()
      .updateApplication(makeResolvedFields('1', 'generated letter content'));

    expect(useApplicationStore.getState().applications[0]).toEqual(
      makeApp('1', 'generated letter content'),
    );
    expect(getPersistedApplications()).toEqual([
      expect.objectContaining({ id: '1', application: 'generated letter content' }),
    ]);
    expect(getPersistedApplications()[0]).not.toHaveProperty('generationStatus');
  });

  it('inserts a completed application when it is missing in memory', () => {
    useApplicationStore.setState({ applications: [] });

    useApplicationStore.getState().updateApplication(makeResolvedFields('1', 'new content'));

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', 'new content')]);
  });
});

describe('rehydrate merge', () => {
  it('preserves in-memory generating applications during rehydrate', async () => {
    useApplicationStore.setState({ applications: [makeApp('1', null, 'generating')] });

    await useApplicationStore.persist.rehydrate();

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', null, 'generating')]);
    expect(selectHasGeneratingApplication(useApplicationStore.getState())).toBe(true);
  });
});

describe('legacy localStorage format', () => {
  it('migrates a raw Application[] payload on read', async () => {
    localStorage.setItem(
      APPLICATIONS_STORAGE_KEY,
      JSON.stringify([makeApp('1', 'content'), makeApp('2', null, 'generating')]),
    );

    await useApplicationStore.persist.rehydrate();

    expect(useApplicationStore.getState().applications).toEqual([makeApp('1', 'content')]);
  });
});
