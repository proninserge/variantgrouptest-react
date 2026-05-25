import type { ApplicationFields, CompletedApplicationFields } from '@/entities/application';
import {
  syncApplicationAsCancelled,
  syncApplicationAsGenerating,
  syncApplicationAsResolved,
  syncApplicationGenerationAborted,
} from '@/entities/application/lib/applicationSync';

import type { GenerationMutationVariables, GenerationSessionRefs } from './generationSession.types';

/**
 * Builds React Query mutation callbacks that sync application state
 * to the store and other tabs on start, success, and failure.
 */
export function createGenerationMutationHandlers({
  applicationIdRef,
  abortControllerRef,
}: GenerationSessionRefs) {
  return {
    onMutate: ({ values }: GenerationMutationVariables) => {
      const applicationId = applicationIdRef.current;
      if (!applicationId) return;

      const pendingApplication: ApplicationFields = {
        id: applicationId,
        ...values,
        application: null,
      };
      syncApplicationAsGenerating(pendingApplication);
    },
    onSuccess: (content: string, { values }: GenerationMutationVariables) => {
      const applicationId = applicationIdRef.current;
      if (!applicationId) return;

      const completedApplication: CompletedApplicationFields = {
        id: applicationId,
        ...values,
        application: content,
      };

      syncApplicationAsResolved(completedApplication);
    },
    onError: (error: Error, { signal }: GenerationMutationVariables) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        if (signal !== abortControllerRef.current?.signal) return;

        const applicationId = applicationIdRef.current;
        if (!applicationId) return;

        syncApplicationGenerationAborted(applicationId);
        return;
      }

      const applicationId = applicationIdRef.current;
      if (!applicationId) return;

      syncApplicationAsCancelled(applicationId);
    },
  };
}
