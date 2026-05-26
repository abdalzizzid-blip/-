import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register offline-cache Service Worker for high-fidelity off-grid movie viewing
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('KoraFlix Service Worker successfully registered! 🚀 scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('KoraFlix Service Worker registration failed ✕:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

