import { isRouteErrorResponse, useRouteError } from 'react-router';

import { DefaultFallback } from '@/shared/ui/error-boundary';

export function RouterErrorFallback() {
  const routeError = useRouteError();

  const error =
    routeError instanceof Error
      ? routeError
      : new Error(
          isRouteErrorResponse(routeError)
            ? `${String(routeError.status)} ${routeError.statusText}`
            : 'Unknown error',
        );

  return <DefaultFallback error={error} />;
}
