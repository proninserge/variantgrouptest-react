import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Application } from './types';

// Sync model:
// - Completed applications → localStorage via persist (partialize).
// - Pending applications → memory only; synced across tabs via BroadcastChannel.
// - merge() keeps in-memory pending entries when rehydrate loads persisted completed list.

export const APPLICATIONS_STORAGE_KEY = 'applications';

interface ApplicationStore {
  applications: Application[];
  removeApplication: (id: string) => void;
  markApplicationPending: (application: Application) => void;
  updateApplication: (application: Application) => void;
}

const isCompleted = (application: Application): boolean => application.application !== null;

type PersistedApplicationStore = Pick<ApplicationStore, 'applications'>;

function mergePersistedState(persisted: unknown, current: ApplicationStore): ApplicationStore {
  const persistedApps = (persisted as PersistedApplicationStore | undefined)?.applications ?? [];
  const pendingApps = current.applications.filter((a) => a.application === null);
  const persistedIds = new Set(persistedApps.map((a) => a.id));

  return {
    ...current,
    applications: [...persistedApps, ...pendingApps.filter((a) => !persistedIds.has(a.id))],
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
          state: { applications: parsed.filter(isCompleted) },
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

export const selectCompletedCount = (s: ApplicationStore): number =>
  s.applications.filter(isCompleted).length;

export const selectHasPending = (s: ApplicationStore): boolean =>
  s.applications.some((a) => a.application === null);

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set) => ({
      applications: [],
      removeApplication: (id) => {
        set((state) => ({
          applications: state.applications.filter((a) => a.id !== id),
        }));
      },
      markApplicationPending: (application) => {
        set((state) => {
          const exists = state.applications.some((a) => a.id === application.id);

          if (exists) {
            return {
              applications: state.applications.map((a) =>
                a.id === application.id ? { ...a, application: null } : a,
              ),
            };
          }

          return { applications: [...state.applications, application] };
        });
      },
      // Upsert: covers cross-tab/rehydrate edge cases where completed app is missing in memory.
      updateApplication: (application) => {
        set((state) => {
          const exists = state.applications.some((a) => a.id === application.id);

          if (exists) {
            return {
              applications: state.applications.map((a) =>
                a.id === application.id ? application : a,
              ),
            };
          }

          return { applications: [...state.applications, application] };
        });
      },
    }),
    {
      name: APPLICATIONS_STORAGE_KEY,
      storage,
      partialize: (state) => ({
        applications: state.applications.filter(isCompleted),
      }),
      merge: mergePersistedState,
    },
  ),
);
