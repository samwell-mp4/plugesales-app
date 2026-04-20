/**
 * Service for managing PWA Push Notifications
 */

const VAPID_PUBLIC_KEY = "BPfadbKE6jI9EkHUWlQFonMhOeWvyoh4wrjgjHdScAizHv9yFOVD3bhtuMfr12-TmK2L-MTzFfl1KT0aKrtzfvQ";
const API_BASE = window.location.origin === 'http://localhost:5173' ? 'http://localhost:3000/api' : '/api';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const pushNotificationService = {
    /**
     * Checks if push notifications are supported and permitted
     */
    checkSupport: () => {
        return 'serviceWorker' in navigator && 'PushManager' in window;
    },

    /**
     * Gets the current subscription status from the backend
     */
    getStatus: async (userId: number) => {
        try {
            const res = await fetch(`${API_BASE}/push/status/${userId}`);
            const data = await res.json();
            return data.subscribed;
        } catch (err) {
            console.error('Error checking push status:', err);
            return false;
        }
    },

    /**
     * Subscribes the current user to push notifications
     */
    subscribeUser: async (userId: number) => {
        if (!pushNotificationService.checkSupport()) return { error: 'Push não suportado' };

            // Check permission first
            if (Notification.permission === 'denied') {
                return { error: 'Permission already denied by user.' };
            }

            const registration = await navigator.serviceWorker.ready;
            
            // Check for existing subscription
            let subscription = await registration.pushManager.getSubscription();
            
            if (!subscription) {
                // Request permission and create new subscription
                try {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                    });
                } catch (subErr: any) {
                    if (subErr.name === 'NotAllowedError') {
                        return { error: 'Permission denied by user during prompt.' };
                    }
                    throw subErr;
                }
            }

            // Save to backend
            const res = await fetch(`${API_BASE}/push/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, subscription })
            });

            return await res.json();
        } catch (err: any) {
            console.error('Error subscribing to push:', err);
            return { error: err.message };
        }
    },

    /**
     * Unsubscribes the current user from push notifications
     */
    unsubscribeUser: async (userId: number) => {
        if (!pushNotificationService.checkSupport()) return;

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            
            if (subscription) {
                await subscription.unsubscribe();
                
                // Remove from backend
                await fetch(`${API_BASE}/push/unsubscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, endpoint: subscription.endpoint })
                });
            }
            return { success: true };
        } catch (err: any) {
            console.error('Error unsubscribing from push:', err);
            return { error: err.message };
        }
    }
};
