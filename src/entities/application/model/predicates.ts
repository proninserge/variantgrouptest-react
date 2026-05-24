import type { Application, ApplicationFields, PersistedApplication } from './types';

export function isApplicationCompleted(application: ApplicationFields): boolean {
  return application.application !== null;
}

export function isApplicationInFlight(application: Application): boolean {
  return application.generationStatus === 'generating';
}

export function isPersistableApplication(
  application: Application,
): application is Application & { application: string } {
  return isApplicationCompleted(application) && !isApplicationInFlight(application);
}

export function toPersistedApplication(
  application: Application & { application: string },
): PersistedApplication {
  const {
    id,
    jobTitle,
    companyName,
    skills,
    additionalDetails,
    application: applicationText,
  } = application;
  return { id, jobTitle, companyName, skills, additionalDetails, application: applicationText };
}

export function hydrateApplication(
  application: ApplicationFields & Partial<Pick<Application, 'generationStatus'>>,
): Application {
  return {
    ...application,
    generationStatus: application.generationStatus ?? 'idle',
  };
}
