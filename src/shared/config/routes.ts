export const Routes = {
  index: 'index',
  home: 'home',
  create: 'create',
  noMatch: '404',
} as const;

export type Route = (typeof Routes)[keyof typeof Routes];

export const RoutePaths = {
  home: '/',
  create: '/create',
  noMatch: '*',
} as const;
