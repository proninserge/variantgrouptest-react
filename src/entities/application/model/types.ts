export type GenerationStatus = 'idle' | 'generating';

/** Persistent fields shared by every application record. */
export interface ApplicationFields {
  id: string;
  jobTitle: string;
  companyName: string;
  skills: string;
  additionalDetails: string;
  application: string | null;
}

/** Full in-memory application. Ephemeral `generationStatus` is owned by the store. */
export type Application = ApplicationFields & {
  generationStatus: GenerationStatus;
};

/** Completed application payload accepted by store mutations from feature layer. */
export type CompletedApplicationFields = ApplicationFields & {
  application: string;
};

/** Shape stored in localStorage — completed content only, no ephemeral fields. */
export type PersistedApplication = CompletedApplicationFields;
