import '@/app/styles/index.scss';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@/app/App';

window.addEventListener('error', (err) => {
  console.warn(`Uncaught Exception ${err.type}`); // логирование uncaught exceptions
});

window.addEventListener('unhandledrejection', (err) => {
  console.warn(`Unhandled promise rejection ${err.type}`); // логирование unhandled promise rejections
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
