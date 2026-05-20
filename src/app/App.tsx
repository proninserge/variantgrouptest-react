import type { ReactElement } from 'react';

import AppRoutes from '@/app/providers/router/routes';
import { ErrorBoundary } from '@/shared/ui/error-boundary';

export function App(): ReactElement {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Logging the catastrophe: ', error);
      }}
    >
      <AppRoutes />
    </ErrorBoundary>
  );
}
