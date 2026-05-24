import { useApplicationStore } from '../model/store';
import type { Application, ApplicationFields, CompletedApplicationFields } from '../model/types';
import { postCancelled, postDeleted, postPending, postResolved } from './channel';

function getApplicationById(id: string): Application | undefined {
  return useApplicationStore.getState().applications.find((application) => application.id === id);
}

/** Updates local state and notifies other tabs that generation has started. */
export function syncApplicationAsGenerating(application: ApplicationFields): void {
  useApplicationStore.getState().markApplicationGenerating(application);

  const syncedApplication = getApplicationById(application.id);
  if (syncedApplication) {
    postPending(syncedApplication);
  }
}

/** Updates local state and notifies other tabs that generation has completed. */
export function syncApplicationAsResolved(application: CompletedApplicationFields): void {
  useApplicationStore.getState().updateApplication(application);

  const syncedApplication = getApplicationById(application.id);
  if (syncedApplication) {
    postResolved(syncedApplication);
  }
}

/** Removes application from local state and notifies other tabs about cancellation. */
export function syncApplicationAsCancelled(applicationId: string): void {
  useApplicationStore.getState().removeApplication(applicationId);
  postCancelled(applicationId);
}

/** Reverts store state after the active generation request was aborted. */
export function syncApplicationGenerationAborted(applicationId: string): void {
  const existing = getApplicationById(applicationId);
  if (!existing) return;

  if (existing.application !== null) {
    useApplicationStore.getState().updateApplication({
      id: existing.id,
      jobTitle: existing.jobTitle,
      companyName: existing.companyName,
      skills: existing.skills,
      additionalDetails: existing.additionalDetails,
      application: existing.application,
    });

    const syncedApplication = getApplicationById(applicationId);
    if (syncedApplication) {
      postResolved(syncedApplication);
    }
    return;
  }

  syncApplicationAsCancelled(applicationId);
}

/** Removes application from local state and notifies other tabs about deletion. */
export function syncApplicationAsDeleted(applicationId: string): void {
  useApplicationStore.getState().removeApplication(applicationId);
  postDeleted(applicationId);
}
