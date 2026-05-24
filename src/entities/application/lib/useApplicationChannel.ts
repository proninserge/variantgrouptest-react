import { useEffect } from 'react';

import { useApplicationStore } from '../model/store';
import type { ChannelMessage } from './channel';
import { CHANNEL_NAME, TAB_ID } from './channel';

export function useApplicationChannel(): void {
  const markApplicationGenerating = useApplicationStore((s) => s.markApplicationGenerating);
  const removeApplication = useApplicationStore((s) => s.removeApplication);
  const updateApplication = useApplicationStore((s) => s.updateApplication);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL_NAME);

    function onMessage(event: MessageEvent<ChannelMessage>) {
      const { data } = event;

      if (data.tabId === TAB_ID) return;

      if (data.type === 'pending') {
        markApplicationGenerating(data.application);
      }

      if (data.type === 'resolved') {
        const { application, ...fields } = data.application;

        if (application !== null) {
          updateApplication({ ...fields, application });
        }
      }

      if (data.type === 'cancelled' || data.type === 'deleted') {
        removeApplication(data.id);
      }
    }

    channel.addEventListener('message', onMessage);
    return () => {
      channel.removeEventListener('message', onMessage);
      channel.close();
    };
  }, [markApplicationGenerating, updateApplication, removeApplication]);
}
