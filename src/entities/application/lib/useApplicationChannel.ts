import { useEffect } from 'react';

import { useApplicationStore } from '../model/store';
import type { ChannelMessage } from './channel';
import { CHANNEL_NAME, TAB_ID } from './channel';

// Получение сообщений из канала
export function useApplicationChannel(): void {
  const addApplication = useApplicationStore((s) => s.addApplication);
  const dropApplication = useApplicationStore((s) => s.dropApplication);
  const removeApplication = useApplicationStore((s) => s.removeApplication);
  const persistApplication = useApplicationStore((s) => s.persistApplication);
  const resetApplicationToPending = useApplicationStore((s) => s.resetApplicationToPending);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);

    function onMessage(event: MessageEvent<ChannelMessage>) {
      const { data } = event;

      if (data.tabId === TAB_ID) return;

      // Получаем письмо и проверяем есть ли оно в сторе
      // И если есть, то устанавливаем его в статус pending, либо добавляем в стор
      if (data.type === 'pending') {
        const exists = useApplicationStore
          .getState()
          .applications.some((a) => a.id === data.application.id);
        if (exists) {
          resetApplicationToPending(data.application.id);
        } else {
          addApplication(data.application);
        }
      }

      if (data.type === 'resolved') {
        persistApplication(data.application);
      }

      // Если письмо отменено, то удаляем его из стора и из localStorage
      if (data.type === 'cancelled') {
        const app = useApplicationStore.getState().applications.find((a) => a.id === data.id);
        if (app?.application !== null) {
          removeApplication(data.id);
        } else {
          dropApplication(data.id);
        }
      }
    }

    channel.addEventListener('message', onMessage);
    return () => {
      channel.removeEventListener('message', onMessage);
      channel.close();
    };
  }, [
    addApplication,
    persistApplication,
    dropApplication,
    removeApplication,
    resetApplicationToPending,
  ]);
}

// Получение сообщений из канала через BroadcastChannel API
// В приложении такого типа считаю целесообразным добавление такого UX
