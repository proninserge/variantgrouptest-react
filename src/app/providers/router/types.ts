import type { RouteObject } from 'react-router';

import type { Route } from '@/shared/config';

export type RouteObjectExt = RouteObject & {
  route: Route;
  children?: RouteObjectExt[];
};
