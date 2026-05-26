import { AdBanner } from '../types';

// Extend AdBanner position type if needed, but we keep compatibility with 'top' | 'middle' | 'sidebar' | 'footer' and let 'footer' double as pre-roll or support custom positions.
export const INITIAL_ADS: AdBanner[] = [
  {
    id: 'ad-home-top',
    title: 'تخفيضات عيد الفطر: باقة كورا فليكس VIP بريميوم بخصم 50%',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&fit=crop',
    targetUrl: '/profile',
    position: 'top',
    isActive: true,
    clicksCount: 142
  },
  {
    id: 'ad-home-middle',
    title: 'تغطية البث المباشر الكبرى: بطولة دوري أبطال أوروبا وسوبر ديربي إيطاليا ليلة اليوم بدقة 4K',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&fit=crop',
    targetUrl: '/',
    position: 'middle',
    isActive: true,
    clicksCount: 89
  },
  {
    id: 'ad-details-sidebar',
    title: 'استمتع بمشاهدة سينمائية خالية من التشويش - اشترك في العضوية بلاتينيوم 💎',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&fit=crop',
    targetUrl: '/profile',
    position: 'sidebar',
    isActive: true,
    clicksCount: 64
  },
  {
    id: 'ad-video-preroll',
    title: 'رعاية الشريك الرياضي الرسمي: تابع أحدث مباريات كأس العالم للأندية مباشرة وحصرياً',
    imageUrl: 'https://images.unsplash.com/photo-1542204172-e7052809a86e?q=80&w=1200&fit=crop',
    targetUrl: 'https://www.google.com',
    position: 'footer', // Also serves as preroll sponsorship
    isActive: true,
    clicksCount: 215
  }
];

const LOCAL_STORAGE_KEY = 'koraflix_custom_ads';

export const adService = {
  // Get all ads from localStorage or initialize with defaults
  getAds(): AdBanner[] {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cached) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_ADS));
      return INITIAL_ADS;
    }
    try {
      return JSON.parse(cached);
    } catch (e) {
      return INITIAL_ADS;
    }
  },

  // Save ads list
  saveAds(ads: AdBanner[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ads));
  },

  // Bidirectionally synchronize ads data with Node.js backend
  async syncWithServer(): Promise<AdBanner[]> {
    try {
      const res = await fetch('/api/ads');
      const data = await res.json();
      if (data && data.success && Array.isArray(data.ads)) {
        const localAds = this.getAds();
        const serverIds = new Set(data.ads.map((a: any) => a.id));

        // Let server know of any ads created locally that are missing on the server
        const missingOnServer = localAds.filter(la => !serverIds.has(la.id));
        for (const missingAd of missingOnServer) {
          await fetch('/api/ads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(missingAd)
          }).catch(e => console.error('Sync missing ad error', e));
        }

        // Re-get from server if we had to populate
        let finalAds = data.ads;
        if (missingOnServer.length > 0) {
          const freshRes = await fetch('/api/ads');
          const freshData = await freshRes.json();
          if (freshData && freshData.success && Array.isArray(freshData.ads)) {
            finalAds = freshData.ads;
          }
        }

        this.saveAds(finalAds);
        return finalAds;
      }
    } catch (e) {
      console.error('Failed to sync ads with server:', e);
    }
    return this.getAds();
  },

  // Register a click for analytics - sends analytics event and loads tracking pixel
  recordClick(adId: string): void {
    const ads = this.getAds();
    const updated = ads.map(ad => {
      if (ad.id === adId) {
        return { ...ad, clicksCount: ad.clicksCount + 1 };
      }
      return ad;
    });
    this.saveAds(updated);

    // 1. Send Background HTTP POST Analytics Event
    fetch(`/api/ads/${adId}/click`, { method: 'POST' })
      .catch(err => console.error('Failed to post ad click event:', err));

    // 2. Trigger Real-Time Transparent Tracking Pixel Load
    try {
      const pixel = new Image();
      pixel.src = `/api/ads/${adId}/pixel.gif?t=${Date.now()}`;
    } catch (e) {
      console.warn('Silent tracker image init failed', e);
    }
  },

  // Toggle active status
  toggleAd(adId: string): AdBanner[] {
    const ads = this.getAds();
    const updated = ads.map(ad => {
      if (ad.id === adId) {
        return { ...ad, isActive: !ad.isActive };
      }
      return ad;
    });
    this.saveAds(updated);

    // Synchronize to server
    fetch(`/api/ads/${adId}/toggle`, { method: 'PUT' })
      .catch(err => console.error('Failed to sync ad toggle with server:', err));

    return updated;
  },

  // Update specific ad attributes
  updateAd(updatedAd: AdBanner): AdBanner[] {
    const ads = this.getAds();
    const updated = ads.map(ad => ad.id === updatedAd.id ? updatedAd : ad);
    this.saveAds(updated);

    // Synchronize to server
    fetch(`/api/ads/${updatedAd.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedAd)
    }).catch(err => console.error('Failed to sync updated ad with server:', err));

    return updated;
  },

  // Create a new customized advertisement
  createAd(ad: Omit<AdBanner, 'id' | 'clicksCount'>): AdBanner[] {
    const ads = this.getAds();
    const newAd: AdBanner = {
      ...ad,
      id: `ad-${Date.now()}`,
      clicksCount: 0
    };
    const updated = [...ads, newAd];
    this.saveAds(updated);

    // Synchronize to server
    fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAd)
    }).catch(err => console.error('Failed to sync created ad with server:', err));

    return updated;
  },

  // Remove advertisement
  deleteAd(adId: string): AdBanner[] {
    const ads = this.getAds();
    const updated = ads.filter(ad => ad.id !== adId);
    this.saveAds(updated);

    // Synchronize to server
    fetch(`/api/ads/${adId}`, { method: 'DELETE' })
      .catch(err => console.error('Failed to sync deleted ad with server:', err));

    return updated;
  }
};
