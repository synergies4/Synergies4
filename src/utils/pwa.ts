'use client';

// PWA Utilities for Backend Integration
export class PWAUtils {
  private static instance: PWAUtils;
  private isOnline: boolean = true;
  private pendingRequests: Map<string, any> = new Map();

  static getInstance(): PWAUtils {
    if (!PWAUtils.instance) {
      PWAUtils.instance = new PWAUtils();
    }
    return PWAUtils.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.setupEventListeners();
    }
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingRequests();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache updated:', event.data.payload);
        }
      });
    }
  }

  // Check if user is online
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Enhanced fetch with offline support
  async fetchWithFallback(url: string, options: RequestInit = {}): Promise<Response> {
    try {
      // Try network request first
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // If successful, cache the response
      if (response.ok) {
        this.cacheResponse(url, response.clone());
      }

      return response;
    } catch (error) {
      console.warn('Network request failed, trying cache:', error);
      
      // Try to get from cache
      const cachedResponse = await this.getCachedResponse(url);
      if (cachedResponse) {
        return cachedResponse;
      }

      // If offline and no cache, queue for later
      if (!this.isOnline && options.method === 'POST') {
        this.queueRequest(url, options);
      }

      throw error;
    }
  }

  // Cache API responses
  private async cacheResponse(url: string, response: Response) {
    if ('caches' in window) {
      try {
        const cache = await caches.open('api-cache-v1');
        await cache.put(url, response);
      } catch (error) {
        console.error('Failed to cache response:', error);
      }
    }
  }

  // Get cached response
  private async getCachedResponse(url: string): Promise<Response | null> {
    if ('caches' in window) {
      try {
        const cache = await caches.open('api-cache-v1');
        const response = await cache.match(url);
        return response || null;
      } catch (error) {
        console.error('Failed to get cached response:', error);
      }
    }
    return null;
  }

  // Queue requests for when back online
  private queueRequest(url: string, options: RequestInit) {
    const requestId = `${url}-${Date.now()}`;
    this.pendingRequests.set(requestId, { url, options });
    console.log('Queued request for later:', requestId);
  }

  // Sync pending requests when back online
  private async syncPendingRequests() {
    console.log('Syncing pending requests...');
    
    for (const [requestId, { url, options }] of this.pendingRequests) {
      try {
        await fetch(url, options);
        this.pendingRequests.delete(requestId);
        console.log('Synced request:', requestId);
      } catch (error) {
        console.error('Failed to sync request:', requestId, error);
      }
    }
  }

  // Course-specific caching
  async getCourseData(courseId: string): Promise<any> {
    const url = `/api/courses/${courseId}`;
    
    try {
      const response = await this.fetchWithFallback(url);
      return await response.json();
    } catch (error) {
      console.error('Failed to get course data:', error);
      return null;
    }
  }

  // User progress caching
  async getUserProgress(userId: string): Promise<any> {
    const url = `/api/users/${userId}/progress`;
    
    try {
      const response = await this.fetchWithFallback(url);
      return await response.json();
    } catch (error) {
      console.error('Failed to get user progress:', error);
      return null;
    }
  }

  // Sync user progress when online
  async syncUserProgress(userId: string, progressData: any): Promise<boolean> {
    const url = `/api/users/${userId}/progress`;
    
    try {
      const response = await this.fetchWithFallback(url, {
        method: 'POST',
        body: JSON.stringify(progressData),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Failed to sync user progress:', error);
      return false;
    }
  }

  // Cache management
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Cache cleared');
      } catch (error) {
        console.error('Failed to clear cache:', error);
      }
    }
  }

  // Get cache size
  async getCacheSize(): Promise<number> {
    if ('caches' in window && 'storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      } catch (error) {
        console.error('Failed to get cache size:', error);
      }
    }
    return 0;
  }

  // Background sync registration
  async registerBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(tag);
        console.log('Background sync registered:', tag);
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    }
  }
}

// React hook for using PWA utilities
export function usePWA() {
  const pwa = PWAUtils.getInstance();
  
  return {
    isOnline: pwa.getOnlineStatus(),
    fetchWithFallback: pwa.fetchWithFallback.bind(pwa),
    getCourseData: pwa.getCourseData.bind(pwa),
    getUserProgress: pwa.getUserProgress.bind(pwa),
    syncUserProgress: pwa.syncUserProgress.bind(pwa),
    clearCache: pwa.clearCache.bind(pwa),
    getCacheSize: pwa.getCacheSize.bind(pwa),
  };
}

// Notification utilities
export class NotificationUtils {
  static async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  static async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: '/favicon-192x192.png',
          badge: '/favicon-96x96.png',
          ...options,
        });
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }
  }

  static async scheduleNotification(title: string, body: string, delay: number): Promise<void> {
    // Schedule notification using service worker
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const data = { title, body, delay };
      
      registration.active?.postMessage({
        type: 'SCHEDULE_NOTIFICATION',
        data,
      });
    }
  }
}

export default PWAUtils; 