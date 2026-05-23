import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';

import { useUserStore } from '@/entities/user';

type UserProviderProps = {
  children: ReactNode;
};

const DEFAULT_APPLICATION_GOAL = 5;

export function UserProvider({ children }: UserProviderProps): ReactElement {
  const setApplicationGoal = useUserStore((s) => s.setApplicationGoal);

  useEffect(() => {
    setApplicationGoal(DEFAULT_APPLICATION_GOAL);
  }, [setApplicationGoal]);

  return <>{children}</>;
}
