import { lazy } from 'react';

import { AppProviders } from '@/app/providers/AppProviders';
import { NotFoundPage } from '@/pages/not-found';
import { RoutePaths, Routes } from '@/shared/config';
import { AppTemplate } from '@/widgets/app-template';

import { createRouteLoader } from './createLoader';
import { RouterErrorFallback } from './RouterErrorFallback';
import type { RouteObjectExt } from './types';

const HomePage = lazy(() => import('@/pages/home').then((m) => ({ default: m.HomePage })));

const CreateApplicationPage = lazy(() =>
  import('@/pages/create-application').then((m) => ({
    default: m.CreateApplicationPage,
  })),
);

export const routerConfig: RouteObjectExt[] = [
  {
    route: Routes.index,
    path: RoutePaths.home,
    element: (
      <AppProviders>
        <AppTemplate />
      </AppProviders>
    ),
    errorElement: <RouterErrorFallback />,
    children: [
      {
        index: true,
        route: Routes.home,
        element: <HomePage />,
      },
      {
        path: RoutePaths.create,
        route: Routes.create,
        // Might be removed, just an additional protection
        loader: createRouteLoader,
        element: <CreateApplicationPage />,
      },
    ],
  },
  {
    route: Routes.noMatch,
    path: RoutePaths.noMatch,
    element: <NotFoundPage />,
    errorElement: <RouterErrorFallback />,
  },
];
