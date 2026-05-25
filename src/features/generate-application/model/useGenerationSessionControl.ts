import { type RefObject, useCallback, useRef, useState } from 'react';

import { syncApplicationAsCancelled } from '@/entities/application/lib/applicationSync';

import type { GenerationMutation, GenerationSessionRefs } from './generationSession.types';
import type { GenerateApplicationFormValues } from './types';

type UseGenerationSessionControlOptions = {
  mutationRef: RefObject<GenerationMutation | null>;
};

type UseGenerationSessionControlResult = {
  refs: GenerationSessionRefs;
  formResetKey: number;
  startGeneration: (values: GenerateApplicationFormValues) => void;
  triggerReset: () => void;
};

/**
 * Owns generation session lifecycle: application id, request abort,
 * form reset, and user actions that start or clear a session.
 */
export function useGenerationSessionControl({
  mutationRef,
}: UseGenerationSessionControlOptions): UseGenerationSessionControlResult {
  const applicationIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [formResetKey, setFormResetKey] = useState(0);

  const refs: GenerationSessionRefs = {
    applicationIdRef,
    abortControllerRef,
  };

  const startGeneration = useCallback(
    (values: GenerateApplicationFormValues) => {
      const activeMutation = mutationRef.current;
      if (!activeMutation) return;

      const isRetry = activeMutation.isSuccess || activeMutation.isError;

      if (!isRetry) {
        applicationIdRef.current = crypto.randomUUID();
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      activeMutation.mutate({ values, signal: controller.signal });
    },
    [mutationRef],
  ); // for the sake of eslint check, could be empty with the same result

  const triggerReset = useCallback(() => {
    const activeMutation = mutationRef.current;
    if (!activeMutation) return;

    const applicationId = applicationIdRef.current;

    abortControllerRef.current?.abort();

    if (applicationId && activeMutation.isPending) {
      syncApplicationAsCancelled(applicationId);
    }

    applicationIdRef.current = null;
    activeMutation.reset();
    setFormResetKey((key) => key + 1);
  }, [mutationRef]); // for the sake of eslint check, could be empty with the same result

  return {
    refs,
    formResetKey,
    startGeneration,
    triggerReset,
  };
}
