import type { ReactElement, ReactNode } from 'react';
import { useEffect } from 'react';

import {
  applicationStorage,
  useApplicationChannel,
  useApplicationStore,
} from '@/entities/application';

type ApplicationProviderProps = {
  children: ReactNode;
};

export function ApplicationProvider({ children }: ApplicationProviderProps): ReactElement {
  const setApplications = useApplicationStore((s) => s.setApplications);

  useApplicationChannel();

  // Получение писем из localStorage и установка в стор
  useEffect(() => {
    const stored = applicationStorage.getAll();
    setApplications(stored);
  }, [setApplications]);

  // Синхронизация писем с другой вкладкой при воздествии на localStorage
  useEffect(() => {
    function onStorageChange(event: StorageEvent) {
      if (event.key === 'applications') {
        setApplications(applicationStorage.getAll());
      }
    }

    window.addEventListener('storage', onStorageChange);
    return () => {
      window.removeEventListener('storage', onStorageChange);
    };
  }, [setApplications]);

  return <>{children}</>;
}

// Разделил эффекты так как каждый их них выполняет свою роль
