import { useApplicationStore } from '../model/store';
import type { Application } from '../model/types';
import { postCancelled, postPending, postResolved } from './channel';

/** Updates local state and notifies other tabs that generation has started. */
export function syncApplicationAsPending(application: Application): void {
  useApplicationStore.getState().markApplicationPending(application);
  postPending(application);
}

/** Updates local state and notifies other tabs that generation has completed. */
export function syncApplicationAsResolved(application: Application): void {
  useApplicationStore.getState().updateApplication(application);
  postResolved(application);
}

/** Removes application from local state and notifies other tabs about cancellation. */
export function syncApplicationAsCancelled(applicationId: string): void {
  useApplicationStore.getState().removeApplication(applicationId);
  postCancelled(applicationId);
}
