import { useEffect, useRef } from 'react';

import type { GenerateApplicationContextValue } from './context';
import type { GenerationMutation } from './generationSession.types';
import { getGenerationErrorMessage, getGenerationStatus } from './getGenerationStatus';
import { useBeforeUnloadGenerationCleanup } from './useBeforeUnloadGenerationCleanup';
import { useGenerateApplicationMutation } from './useGenerateApplicationMutation';
import { useGenerationSessionControl } from './useGenerationSessionControl';

/** Composes session control and mutation into the public generation context API. */
export function useGenerateApplicationSession(): GenerateApplicationContextValue {
  const mutationRef = useRef<GenerationMutation | null>(null);
  const sessionControl = useGenerationSessionControl({ mutationRef });
  const mutation = useGenerateApplicationMutation(sessionControl.refs);

  useEffect(() => {
    mutationRef.current = mutation;
  });

  useBeforeUnloadGenerationCleanup({
    isGenerationInProgress: mutation.isPending,
    applicationIdRef: sessionControl.refs.applicationIdRef,
  });

  return {
    status: getGenerationStatus(mutation.isPending, mutation.isSuccess, mutation.isError),
    formValues: mutation.variables?.values ?? null,
    generatedContent: mutation.data ?? null,
    error: getGenerationErrorMessage(mutation.error),
    formResetKey: sessionControl.formResetKey,
    startGeneration: sessionControl.startGeneration,
    triggerReset: sessionControl.triggerReset,
  };
}
