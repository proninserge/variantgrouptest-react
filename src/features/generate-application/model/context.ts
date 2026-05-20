import { createContext, useContext } from 'react';

import type { GenerateApplicationFormValues } from './types';

export interface GenerationActionsContextValue {
  startGeneration: (values: GenerateApplicationFormValues) => void;
  triggerReset: () => void;
}

export const GenerationActionsContext = createContext<GenerationActionsContextValue | null>(null);

export function useGenerationActions(): GenerationActionsContextValue {
  const context = useContext(GenerationActionsContext);
  if (!context) {
    throw new Error('useGenerationActions must be used within ApplicationGenerationProvider');
  }
  return context;
}
