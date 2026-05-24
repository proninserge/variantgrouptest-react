import { redirect } from 'react-router';

import { selectHasGeneratingApplication, useApplicationStore } from '@/entities/application';
import { RoutePaths } from '@/shared/config';

/**
 * Blocks navigation to /create while any application is being generated.
 * A generating entry is added synchronously in onMutate before the fetch starts,
 * so selectHasGeneratingApplication is true for the entire duration of a generation.
 */
export function createRouteLoader() {
  if (selectHasGeneratingApplication(useApplicationStore.getState())) {
    return redirect(RoutePaths.home);
  }

  return null;
}
