export interface GenerateApplicationFormValues {
  jobTitle: string;
  companyName: string;
  skills: string;
  additionalDetails: string;
}

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';
