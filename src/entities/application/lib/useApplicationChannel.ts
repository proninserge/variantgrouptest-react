import { useEffect } from 'react';

import { useApplicationStore } from '../model/store';
import type { ChannelMessage } from './channel';
import { CHANNEL_NAME, TAB_ID } from './channel';

export function useApplicationChannel(): void {
  const markApplicationPending = useApplicationStore((s) => s.markApplicationPending);
  const removeApplication = useApplicationStore((s) => s.removeApplication);
  const updateApplication = useApplicationStore((s) => s.updateApplication);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);

    function onMessage(event: MessageEvent<ChannelMessage>) {
      const { data } = event;

      if (data.tabId === TAB_ID) return;

      if (data.type === 'pending') {
        markApplicationPending(data.application);
      }

      if (data.type === 'resolved') {
        updateApplication(data.application);
      }

      if (data.type === 'cancelled') {
        removeApplication(data.id);
      }
    }

    channel.addEventListener('message', onMessage);
    return () => {
      channel.removeEventListener('message', onMessage);
      channel.close();
    };
  }, [markApplicationPending, updateApplication, removeApplication]);
}
