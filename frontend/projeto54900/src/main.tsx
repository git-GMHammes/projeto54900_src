// Entrypoint. Ordem importa: bootstrap (CSS/JS) antes do App.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './bootstrap';
import App from '@/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento #root nao encontrado no index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
