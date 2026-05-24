import { isApplicationCompleted, isApplicationInFlight } from './predicates';
import type { Application } from './types';

export interface ApplicationStoreState {
  applications: Application[];
}

export const selectCompletedCount = (state: ApplicationStoreState): number =>
  state.applications.filter(isApplicationCompleted).length;

export const selectHasGeneratingApplication = (state: ApplicationStoreState): boolean =>
  state.applications.some(isApplicationInFlight);
