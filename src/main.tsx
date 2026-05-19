import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// ── Service Worker Registration with Auto-Refresh ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('✅ SW registered:', registration.scope);

        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update().catch(() => {});
        }, 60000);

        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[SW] 🔄 New version available!');
              // Show update toast
              window.dispatchEvent(new CustomEvent('ertiqa:update', {
                detail: { message: 'تحديث جديد متاح! جاري التحديث...' }
              }));
              // Auto-reload after 3 seconds
              setTimeout(() => {
                window.location.reload();
              }, 3000);
            }
          });
        });

        if ('sync' in (registration as any)) {
          (registration as any).sync.register('ertiqa-sync').catch(() => {});
        }
      })
      .catch((err) => console.log('SW registration failed:', err));
  });

  // Listen for messages from SW
  navigator.serviceWorker.addEventListener('message', (e) => {
    if (e.data?.type === 'FORCE_SYNC') {
      window.dispatchEvent(new CustomEvent('ertiqa:sync'));
    }
  });
}

// ── Request notification permission ──
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

// ── Register for background sync ──
async function requestBackgroundSync() {
  if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
    const reg = await navigator.serviceWorker.ready;
    try {
      await (reg as any).sync.register('ertiqa-sync');
    } catch {}
  }
}
requestBackgroundSync();

// ── Mount app ──
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
