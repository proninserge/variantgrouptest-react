import { useMutation } from '@tanstack/react-query';

import { generateApplication } from '@/features/generate-application/api/generateApplication';

import { createGenerationMutationHandlers } from './generationMutationHandlers';
import type {
  GenerationMutation,
  GenerationMutationVariables,
  GenerationSessionRefs,
} from './generationSession.types';

/** Runs the generate-application API call and keeps mutation async state. */
export function useGenerateApplicationMutation(refs: GenerationSessionRefs): GenerationMutation {
  const handlers = createGenerationMutationHandlers(refs);

  return useMutation<string, Error, GenerationMutationVariables>({
    mutationKey: ['generate-application'],
    retry: false,
    mutationFn: async ({ values, signal }) => {
      const content = await generateApplication(values, signal);
      if (!content.trim()) throw new Error('Generated content is empty');
      return content;
    },
    ...handlers,
  });
}
