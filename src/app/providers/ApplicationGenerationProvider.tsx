import type { ReactElement, ReactNode } from 'react';

import { GenerateApplicationContext } from '@/features/generate-application/model/context';
import { useGenerateApplicationSession } from '@/features/generate-application/model/useGenerateApplicationSession';

type ApplicationGenerationProviderProps = {
  children: ReactNode;
};

export function ApplicationGenerationProvider({
  children,
}: ApplicationGenerationProviderProps): ReactElement {
  const generation = useGenerateApplicationSession();

  return (
    <GenerateApplicationContext.Provider value={generation}>
      {children}
    </GenerateApplicationContext.Provider>
  );
}
