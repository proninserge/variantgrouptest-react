import { create } from 'zustand';

import type { GenerateApplicationFormValues, GenerationStatus } from './types';

interface GenerationStore {
  status: GenerationStatus;
  formValues: GenerateApplicationFormValues | null;
  generatedContent: string | null;
  error: string | null;
  resetSignal: number; // для resetState

  setGenerating: (formValues: GenerateApplicationFormValues) => void;
  setSuccess: (content: string) => void;
  setError: (message: string) => void;
  resetState: () => void;
}

export const useGenerationStore = create<GenerationStore>((set) => ({
  status: 'idle',
  formValues: null,
  generatedContent: null,
  error: null,
  resetSignal: 0,

  setGenerating: (formValues) => {
    set({ status: 'generating', formValues, generatedContent: null, error: null });
  },

  setSuccess: (content) => {
    set({ status: 'success', generatedContent: content });
  },

  setError: (message) => {
    set({ status: 'error', error: message });
  },

  resetState: () => {
    set((state) => ({
      status: 'idle',
      formValues: null,
      generatedContent: null,
      error: null,
      resetSignal: state.resetSignal + 1,
    }));
  },
}));

// formValues и generatedContent дублируют mutation.variables и mutation.data из React Query
// Это намеренно: стор выступает view-model адаптером от контекста провайдера
// Обеспечивает независимость потребителей от провайдеров и тестируемость
