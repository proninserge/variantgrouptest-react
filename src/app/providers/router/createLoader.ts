import { redirect } from 'react-router';

import { useApplicationStore } from '@/entities/application';
import { RoutePaths } from '@/shared/config';

/**
 * Blocks navigation to /create while any application is pending (application === null).
 * A pending entry is added synchronously in onMutate before the fetch starts,
 * so hasPending is true for the entire duration of a generation.
 */
export function createRouteLoader() {
  const hasPending = useApplicationStore
    .getState()
    .applications.some((a) => a.application === null);

  if (hasPending) {
    return redirect(RoutePaths.home);
  }

  return null;
}
