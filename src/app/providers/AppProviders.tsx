import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement, ReactNode } from 'react';

import { ApplicationGenerationProvider } from './ApplicationGenerationProvider';
import { ApplicationProvider } from './ApplicationProvider';
import { UserProvider } from './UserProvider';

// Настройки defaultOptions пока не нужны
// С ростом проекта и добавлением новых запросов можно будет добавить
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
