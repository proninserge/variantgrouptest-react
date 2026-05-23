import { createContext, useContext } from 'react';

import type { GenerateApplicationFormValues, GenerationStatus } from './types';

export interface GenerateApplicationContextValue {
  status: GenerationStatus;
  formValues: GenerateApplicationFormValues | null;
  generatedContent: string | null;
  error: string | null;
  formResetKey: number;
  startGeneration: (values: GenerateApplicationFormValues) => void;
  triggerReset: () => void;
}

export const GenerateApplicationContext = createContext<GenerateApplicationContextValue | null>(
  null,
);

export function useGenerateApplication(): GenerateApplicationContextValue {
  const context = useContext(GenerateApplicationContext);

  if (!context) {
    throw new Error('useGenerateApplication must be used within ApplicationGenerationProvider');
  }

  return context;
}
