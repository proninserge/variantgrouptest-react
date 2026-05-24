import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';

import { ApplicationGenerationProvider } from './ApplicationGenerationProvider';
import { ApplicationProvider } from './ApplicationProvider';
import { UserProvider } from './UserProvider';

// The defaultOptions config is not needed for the current app
// Adding new queries, mutations will require updating the default options
const queryClient = new QueryClient();

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps): ReactElement {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <ApplicationProvider>
          <ApplicationGenerationProvider>{children}</ApplicationGenerationProvider>
        </ApplicationProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
