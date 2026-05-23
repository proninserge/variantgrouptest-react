import { useMutation } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { Application } from '@/entities/application';
import {
  postCancelled,
  postPending,
  postResolved,
  useApplicationStore,
} from '@/entities/application';
import { generateApplication } from '@/features/generate-application/api/generateApplication';
import { GenerationActionsContext } from '@/features/generate-application/model/context';
import { useGenerationStore } from '@/features/generate-application/model/store';
import type { GenerateApplicationFormValues } from '@/features/generate-application/model/types';

type ApplicationGenerationProviderProps = {
  children: ReactNode;
};

type MutationVariables = {
  values: GenerateApplicationFormValues;
  signal: AbortSignal;
};

export function ApplicationGenerationProvider({
  children,
}: ApplicationGenerationProviderProps): ReactElement {
  const markApplicationPending = useApplicationStore((s) => s.markApplicationPending);
  const updateApplication = useApplicationStore((s) => s.updateApplication);
  const removeApplication = useApplicationStore((s) => s.removeApplication);

  const setGenerating = useGenerationStore((s) => s.setGenerating);
  const setSuccess = useGenerationStore((s) => s.setSuccess);
  const setError = useGenerationStore((s) => s.setError);
  const resetState = useGenerationStore((s) => s.resetState);

  const applicationIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const mutationRef = useRef<ReturnType<
    typeof useMutation<string, Error, MutationVariables>
  > | null>(null);

  const mutation = useMutation<string, Error, MutationVariables>({
    mutationKey: ['generate-application'],

    retry: false,

    mutationFn: async ({ values, signal }) => {
      const content = await generateApplication(values, signal);
      if (!content.trim()) throw new Error('Generated content is empty');
      return content;
    },

    onMutate: ({ values }) => {
      const id = applicationIdRef.current;
      if (!id) return;
      setGenerating(values);

      const pendingApplication: Application = { id, ...values, application: null };

      markApplicationPending(pendingApplication);
      postPending(pendingApplication);
    },

    onSuccess: (content, { values }) => {
      const id = applicationIdRef.current;
      if (!id) return;
      const completedApplication: Application = { id, ...values, application: content };

      updateApplication(completedApplication);
      postResolved(completedApplication);
      setSuccess(content);
    },

    onError: (error) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;

      const id = applicationIdRef.current;
      if (!id) return;
      const message = error instanceof Error ? error.message : 'Generation failed';

      removeApplication(id);
      postCancelled(id);
      setError(message);
    },
  });

  // Синхронизируем реф с актуальным объектом мутации после каждого рендера.
  // Это позволяет startGeneration и triggerReset иметь пустой массив зависимостей
  // и при этом всегда читать свежее состояние (isPending, isSuccess и т.д.)
  // без пересоздания колбэков при каждом изменении статуса мутации.
  // Когда useEffectEvent стабилизируется в React, реф станет не нужен:
  // стабильный колбэк сможет читать актуальные значения напрямую.
  useEffect(() => {
    mutationRef.current = mutation;
  });

  // Обработка закрытия вкладки во время генерации
  useEffect(() => {
    if (!mutation.isPending) return;

    const id = applicationIdRef.current;
    const notifyOtherTabsOnClose = () => {
      // Решение UX: полагаем что ретрай письма как бы логически "обнуляет" предыдущий результат по этому ИД
      if (id) {
        removeApplication(id);
        postCancelled(id);
      }
    };

    window.addEventListener('beforeunload', notifyOtherTabsOnClose);
    return () => {
      window.removeEventListener('beforeunload', notifyOtherTabsOnClose);
    };
  }, [mutation.isPending, removeApplication]);

  const startGeneration = useCallback((values: GenerateApplicationFormValues) => {
    if (!mutationRef.current) return;
    const { isSuccess, isError, mutate } = mutationRef.current;
    const isRetry = isSuccess || isError;

    if (!isRetry) {
      applicationIdRef.current = crypto.randomUUID();
    }
    // При ретрае: не трогаем applicationIdRef

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    mutate({ values, signal: controller.signal });
  }, []);

  const triggerReset = useCallback(() => {
    if (!mutationRef.current) return;
    const { isPending, reset } = mutationRef.current;
    const id = applicationIdRef.current;

    abortControllerRef.current?.abort();

    if (id && isPending) {
      removeApplication(id);
      postCancelled(id);
    }

    applicationIdRef.current = null;
    reset();
    resetState();
  }, [removeApplication, resetState]);

  const contextValue = useMemo(
    () => ({ startGeneration, triggerReset }),
    [startGeneration, triggerReset],
  );

  return (
    <GenerationActionsContext.Provider value={contextValue}>
      {children}
    </GenerationActionsContext.Provider>
  );
}
