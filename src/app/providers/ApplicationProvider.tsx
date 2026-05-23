import type { ReactElement, ReactNode } from 'react';

import { useApplicationChannel } from '@/entities/application';

type ApplicationProviderProps = {
  children: ReactNode;
};

export function ApplicationProvider({ children }: ApplicationProviderProps): ReactElement {
  useApplicationChannel();

  return <>{children}</>;
}
