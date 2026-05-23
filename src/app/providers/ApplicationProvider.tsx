import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';

import {
  APPLICATIONS_STORAGE_KEY,
  useApplicationChannel,
  useApplicationStore,
} from '@/entities/application';

type ApplicationProviderProps = {
  children: ReactNode;
};

export function ApplicationProvider({ children }: ApplicationProviderProps): ReactElement {
  useApplicationChannel();

  useEffect(() => {
    function onStorageChange(event: StorageEvent) {
      if (event.key === APPLICATIONS_STORAGE_KEY) {
        void useApplicationStore.persist.rehydrate();
      }
    }

    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  return <>{children}</>;
}
