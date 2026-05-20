import { beforeEach } from 'vitest';

// BroadcastChannel is not available in jsdom
class MockBroadcastChannel {
  postMessage() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
  dispatchEvent() {
    return false;
  }
}

Object.defineProperty(global, 'BroadcastChannel', {
  value: MockBroadcastChannel,
  writable: true,
});

beforeEach(() => {
  localStorage.clear();
});
