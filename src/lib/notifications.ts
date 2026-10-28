import { createStore } from './store';

export type NotificationState = 'unsupported' | NotificationPermission;

function current(): NotificationState {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
}

const store = createStore({ state: current() });

export const useNotificationState = () => store.use().state;
export const notificationState = current;

export async function requestNotifications(): Promise<NotificationState> {
  if (current() === 'unsupported') return 'unsupported';
  const result = await Notification.requestPermission();
  store.set({ state: result });
  return result;
}

/** Shows a system notification through the service worker (required on Android). */
export async function notify(
  title: string,
  options: NotificationOptions & { data?: { url: string } },
): Promise<boolean> {
  if (current() !== 'granted') return false;
  const full: NotificationOptions = {
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    lang: 'pl',
    ...options,
  };
  try {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration) {
      await registration.showNotification(title, full);
      return true;
    }
    new Notification(title, full);
    return true;
  } catch {
    return false;
  }
}
