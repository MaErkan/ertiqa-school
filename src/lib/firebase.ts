/* ═══════════════════════════════════════════════════════════════════════════════
   Firebase Cloud Messaging — Push Notifications for Ertiqa
   ═══════════════════════════════════════════════════════════════════════════ */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ═══ Firebase Config — ستُملأ بعد إنشاء المشروع ═══
const firebaseConfig = {
  apiKey: 'FIREBASE_API_KEY',
  authDomain: 'FIREBASE_AUTH_DOMAIN',
  projectId: 'FIREBASE_PROJECT_ID',
  storageBucket: 'FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'FIREBASE_MESSAGING_SENDER_ID',
  appId: 'FIREBASE_APP_ID',
};

let app: any = null;
let messaging: any = null;
let fcmToken: string | null = null;

export function initFirebase(): boolean {
  try {
    // Skip if not configured
    if (firebaseConfig.apiKey === 'FIREBASE_API_KEY') {
      console.log('[FCM] Firebase not configured yet');
      return false;
    }

    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);

    // Listen for messages while app is in foreground
    onMessage(messaging, (payload: any) => {
      console.log('[FCM] Message received:', payload);
      showLocalNotification(payload.notification?.title || 'زيارة جديدة', payload.notification?.body || '');

      // Dispatch event so React updates
      window.dispatchEvent(new CustomEvent('ertiqa:push', { detail: payload.data }));
    });

    console.log('[FCM] Firebase initialized');
    return true;
  } catch (err) {
    console.error('[FCM] Init error:', err);
    return false;
  }
}

export async function requestFcmToken(): Promise<string | null> {
  if (!messaging) return null;

  try {
    // Check permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('[FCM] Notification permission denied');
      return null;
    }

    // Get token
    const token = await getToken(messaging, {
      vapidKey: 'VAPID_PUBLIC_KEY', // Will be filled
    });

    if (token) {
      fcmToken = token;
      localStorage.setItem('fcm_token', token);
      console.log('[FCM] Token:', token.substring(0, 20) + '...');
      return token;
    }
  } catch (err) {
    console.error('[FCM] Token error:', err);
  }
  return null;
}

export function getStoredFcmToken(): string | null {
  return fcmToken || localStorage.getItem('fcm_token');
}

// Show notification using service worker
function showLocalNotification(title: string, body: string) {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, {
        body,
        icon: '/pwa-icon-192.png',
        badge: '/pwa-icon-72.png',
        dir: 'rtl',
        vibrate: [200, 100, 200],
        requireInteraction: false,
      });
    });
  }
}

export async function sendPushNotification(title: string, body: string, data?: Record<string, string>) {
  // Try to use service worker for background notification
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, {
      body,
      icon: '/pwa-icon-192.png',
      badge: '/pwa-icon-72.png',
      dir: 'rtl',
      tag: 'ertiqa-visit',
      requireInteraction: false,
      data: data || {},
    });
  }
}
