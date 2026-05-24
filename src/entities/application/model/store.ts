import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  hydrateApplication,
  isApplicationCompleted,
  isApplicationInFlight,
  isPersistableApplication,
  toPersistedApplication,
} from './predicates';
import { selectCompletedCount, selectHasGeneratingApplication } from './selectors';
import type { Application, ApplicationFields, CompletedApplicationFields } from './types';

// Sync model:
// - Completed applications → localStorage via persist (partialize).
// - In-flight applications → memory only; synced across tabs via BroadcastChannel.
// - merge() keeps in-memory in-flight entries when rehydrate loads persisted completed list.

export const APPLICATIONS_STORAGE_KEY = 'applications';

export { selectCompletedCount, selectHasGeneratingApplication };

interface ApplicationStore {
  applications: Application[];
  removeApplication: (id: string) => void;
  markApplicationGenerating: (application: ApplicationFields) => void;
  updateApplication: (application: CompletedApplicationFields) => void;
}

type PersistedApplicationStore = Pick<ApplicationStore, 'applications'>;

function mergePersistedState(persisted: unknown, current: ApplicationStore): ApplicationStore {
  const persistedApps = (
    (persisted as PersistedApplicationStore | undefined)?.applications ?? []
  ).map(hydrateApplication);
  const inFlightApps = current.applications.filter(isApplicationInFlight);
  const inFlightIds = new Set(inFlightApps.map((a) => a.id));

  return {
    ...current,
    applications: [...persistedApps.filter((a) => !inFlightIds.has(a.id)), ...inFlightApps],
  };
}

const storage = createJSONStorage<Pick<ApplicationStore, 'applications'>>(() => ({
  getItem: (name) => {
    const value = localStorage.getItem(name);
    if (!value) return null;

    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return JSON.stringify({
          state: {
            applications: parsed.filter(isApplicationCompleted).map(hydrateApplication),
          },
          version: 0,
        });
      }
    } catch {
      return null;
    }

    return value;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
}));

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set) => ({
      applications: [],
      removeApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((a) => a.id !== id),
        }));
      },
      markApplicationGenerating: (application) => {
        set((state) => {
          const existing = state.applications.find((a) => a.id === application.id);
          const generatingApplication: Application = {
            ...application,
            application: existing?.application ?? application.application,
            generationStatus: 'generating',
          };

          if (existing) {
            return {
              applications: state.applications.map((a) =>
                a.id === application.id ? generatingApplication : a,
              ),
            };
          }

          return { applications: [...state.applications, generatingApplication] };
        });
      },
      updateApplication: (application) => {
        const resolvedApplication: Application = {
          ...application,
          generationStatus: 'idle',
        };

        set((state) => {
          const exists = state.applications.some((a) => a.id === application.id);

          if (exists) {
            return {
              applications: state.applications.map((a) =>
                a.id === application.id ? resolvedApplication : a,
              ),
            };
          }

          return { applications: [...state.applications, resolvedApplication] };
        });
      },
    }),
    {
      name: APPLICATIONS_STORAGE_KEY,
      storage,
      partialize: (state) =>
        ({
          applications: state.applications
            .filter(isPersistableApplication)
            .map(toPersistedApplication),
        }) as Pick<ApplicationStore, 'applications'>,
      merge: mergePersistedState,
    },
  ),
);
