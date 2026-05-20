import { useMemo } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { routerConfig } from './config';

export default function AppRoutes() {
  const router = useMemo(() => createBrowserRouter(routerConfig), []);
  return <RouterProvider router={router} />;
}
