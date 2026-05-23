import { type RefObject, useEffect } from 'react';

import { syncApplicationAsCancelled } from '@/entities/application/lib/applicationSync';

type UseBeforeUnloadGenerationCleanupOptions = {
  isGenerationInProgress: boolean;
  applicationIdRef: RefObject<string | null>;
};

/**
 * Cleans up an in-flight generation when the tab is closed.
 * Other tabs receive cancellation via BroadcastChannel.
 */
export function useBeforeUnloadGenerationCleanup({
  isGenerationInProgress,
  applicationIdRef,
}: UseBeforeUnloadGenerationCleanupOptions): void {
  useEffect(() => {
    if (!isGenerationInProgress) return;

    const handleBeforeUnload = () => {
      const applicationId = applicationIdRef.current;
      if (applicationId) {
        syncApplicationAsCancelled(applicationId);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isGenerationInProgress, applicationIdRef]);
}
