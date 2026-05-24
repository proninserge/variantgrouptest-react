import { describe, expect, it } from 'vitest';

import {
  hydrateApplication,
  isApplicationCompleted,
  isApplicationInFlight,
  isPersistableApplication,
  toPersistedApplication,
} from './predicates';
import type { Application } from './types';

const completedApplication: Application & { application: string } = {
  id: '1',
  jobTitle: 'Engineer',
  companyName: 'Acme Corp',
  skills: 'TypeScript React',
  additionalDetails: 'Details',
  application: 'letter',
  generationStatus: 'idle',
};

describe('application predicates', () => {
  it('treats content presence as completion regardless of generation status', () => {
    const regeneratingWithContent: Application = {
      ...completedApplication,
      generationStatus: 'generating',
    };

    expect(isApplicationCompleted(completedApplication)).toBe(true);
    expect(isApplicationCompleted(regeneratingWithContent)).toBe(true);
    expect(isApplicationCompleted({ ...completedApplication, application: null })).toBe(false);
  });

  it('uses generationStatus as the single source of truth for in-flight state', () => {
    const regeneratingApplication: Application = {
      ...completedApplication,
      generationStatus: 'generating',
    };

    expect(isApplicationInFlight(regeneratingApplication)).toBe(true);
    expect(isApplicationInFlight(completedApplication)).toBe(false);
  });

  it('hydrates persisted records with idle generation status', () => {
    const persisted = toPersistedApplication(completedApplication);

    expect(hydrateApplication(persisted)).toEqual(completedApplication);
  });

  it('persists only idle completed applications without ephemeral fields', () => {
    expect(isPersistableApplication(completedApplication)).toBe(true);

    if (isPersistableApplication(completedApplication)) {
      expect(toPersistedApplication(completedApplication)).toEqual({
        id: '1',
        jobTitle: 'Engineer',
        companyName: 'Acme Corp',
        skills: 'TypeScript React',
        additionalDetails: 'Details',
        application: 'letter',
      });
    }

    expect(
      isPersistableApplication({ ...completedApplication, generationStatus: 'generating' }),
    ).toBe(false);
  });
});
