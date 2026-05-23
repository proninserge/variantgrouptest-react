import type { Application } from '../model/types';

export type ChannelMessage =
  | { type: 'pending'; application: Application; tabId: string }
  | { type: 'resolved'; application: Application; tabId: string }
  | { type: 'cancelled'; id: string; tabId: string }
  | { type: 'deleted'; id: string; tabId: string };

export const CHANNEL_NAME = 'applications';

export const TAB_ID = crypto.randomUUID();

let _sender: BroadcastChannel | null = null;

// It is created at the first action call and lives until the tab is closed
function getSender(): BroadcastChannel {
  _sender ??= new BroadcastChannel(CHANNEL_NAME);
  return _sender;
}

export function postPending(application: Application): void {
  getSender().postMessage({
    type: 'pending',
    application,
    tabId: TAB_ID,
  } satisfies ChannelMessage);
}

export function postResolved(application: Application): void {
  getSender().postMessage({
    type: 'resolved',
    application,
    tabId: TAB_ID,
  } satisfies ChannelMessage);
}

export function postCancelled(id: string): void {
  getSender().postMessage({
    type: 'cancelled',
    id,
    tabId: TAB_ID,
  } satisfies ChannelMessage);
}

export function postDeleted(id: string): void {
  getSender().postMessage({
    type: 'deleted',
    id,
    tabId: TAB_ID,
  } satisfies ChannelMessage);
}
