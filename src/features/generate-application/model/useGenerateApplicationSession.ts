import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { ApplicationFields, CompletedApplicationFields } from '@/entities/application';
import {
  syncApplicationAsCancelled,
  syncApplicationAsGenerating,
  syncApplicationAsResolved,
  syncApplicationGenerationAborted,
} from '@/entities/application/lib/applicationSync';
import { generateApplication } from '@/features/generate-application/api/generateApplication';

import type { GenerateApplicationContextValue } from './context';
import { getGenerationErrorMessage, getGenerationStatus } from './getGenerationStatus';
import type { GenerateApplicationFormValues } from './types';
import { useBeforeUnloadGenerationCleanup } from './useBeforeUnloadGenerationCleanup';

type GenerationMutationVariables = {
  values: GenerateApplicationFormValues;
  signal: AbortSignal;
};

type GenerationMutation = ReturnType<
  typeof useMutation<string, Error, GenerationMutationVariables>
>;

export function useGenerateApplicationSession(): GenerateApplicationContextValue {
  const applicationIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mutationRef = useRef<GenerationMutation | null>(null);
  const [formResetKey, setFormResetKey] = useState(0);

  const mutation = useMutation<string, Error, GenerationMutationVariables>({
    mutationKey: ['generate-application'],
    retry: false,
    mutationFn: async ({ values, signal }) => {
      const content = await generateApplication(values, signal);
      if (!content.trim()) throw new Error('Generated content is empty');
      return content;
    },
    onMutate: ({ values }) => {
      const applicationId = applicationIdRef.current;
      if (!applicationId) return;

      const pendingApplication: ApplicationFields = {
        id: applicationId,
        ...values,
        application: null,
      };
      syncApplicationAsGenerating(pendingApplication);
    },
    onSuccess: (content, { values }) => {
      const applicationId = applicationIdRef.current;
      if (!applicationId) return;

      const completedApplication: CompletedApplicationFields = {
        id: applicationId,
        ...values,
        application: content,
      };

      syncApplicationAsResolved(completedApplication);
    },
    onError: (error, { signal }) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // Ignore aborts from a superseded request; revert only the active one.
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
  });

  useEffect(() => {
    mutationRef.current = mutation;
  });

  useBeforeUnloadGenerationCleanup({
    isGenerationInProgress: mutation.isPending,
    applicationIdRef,
  });

  const startGeneration = useCallback((values: GenerateApplicationFormValues) => {
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
  }, []);

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
  }, []);

  return {
    status: getGenerationStatus(mutation.isPending, mutation.isSuccess, mutation.isError),
    formValues: mutation.variables?.values ?? null,
    generatedContent: mutation.data ?? null,
    error: getGenerationErrorMessage(mutation.error),
    formResetKey,
    startGeneration,
    triggerReset,
  };
}
