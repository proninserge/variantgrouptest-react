import type { useMutation } from '@tanstack/react-query';
import type { RefObject } from 'react';

import type { GenerateApplicationFormValues } from './types';

/** Internal types for the generation session model. Not exported from the feature public API. */

export type GenerationSessionRefs = {
  applicationIdRef: RefObject<string | null>;
  abortControllerRef: RefObject<AbortController | null>;
};

export type GenerationMutationVariables = {
  values: GenerateApplicationFormValues;
  signal: AbortSignal;
};

export type GenerationMutation = ReturnType<
  typeof useMutation<string, Error, GenerationMutationVariables>
>;
