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
  const addApplication = useApplicationStore((s) => s.addApplication);
  const persistApplication = useApplicationStore((s) => s.persistApplication);
  const dropApplication = useApplicationStore((s) => s.dropApplication);
  const removeApplication = useApplicationStore((s) => s.removeApplication);
  const resetApplicationToPending = useApplicationStore((s) => s.resetApplicationToPending);

  const setGenerating = useGenerationStore((s) => s.setGenerating);
  const setSuccess = useGenerationStore((s) => s.setSuccess);
  const setError = useGenerationStore((s) => s.setError);
  const resetState = useGenerationStore((s) => s.resetState);

  const applicationIdRef = useRef<string | null>(null);
  const wasPersistedRef = useRef(false);
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

      if (wasPersistedRef.current) {
        // Если письмо уже было сохранено в localStorage, сбрасываем его в статус Пендинг
        resetApplicationToPending(id);
      } else {
        addApplication(pendingApplication);
      }
      postPending(pendingApplication);
    },

    onSuccess: (content, { values }) => {
      const id = applicationIdRef.current;
      if (!id) return;
      const completedApplication: Application = { id, ...values, application: content };

      persistApplication(completedApplication);
      postResolved(completedApplication);
      wasPersistedRef.current = true;
      setSuccess(content);
    },

    onError: (error) => {
      if (error instanceof DOMException && error.name === 'AbortError') return;

      const id = applicationIdRef.current;
      if (!id) return;
      const message = error instanceof Error ? error.message : 'Generation failed';

      if (wasPersistedRef.current) {
        // Если письмо было сохранено в localStorage, удаляем его полностью
        removeApplication(id);
      } else {
        // Удаляем письмо из стора при первичной генерации
        dropApplication(id);
      }
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
      wasPersistedRef.current = false;
    }
    // При ретрае: не трогаем applicationIdRef и wasPersistedRef

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
      if (wasPersistedRef.current) {
        removeApplication(id);
      } else {
        dropApplication(id);
      }
      postCancelled(id);
    }

    applicationIdRef.current = null;
    wasPersistedRef.current = false;
    reset();
    resetState();
  }, [dropApplication, removeApplication, resetState]);

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
