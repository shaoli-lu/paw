interface CacheEntry {
  timestamp: number;
  data: any;
}

const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const CACHE_VERSION = 'v1.1'; // Update this to bust cache

export const fetchWithCache = async (url: string) => {
  const cacheKey = `${CACHE_VERSION}_${url}`;
  // Check if we have a valid cached response
  try {
    const cachedItem = localStorage.getItem(cacheKey);
    if (cachedItem) {
      const entry: CacheEntry = JSON.parse(cachedItem);
      if (Date.now() - entry.timestamp < CACHE_EXPIRY_MS) {
        return entry.data;
      }
    }
  } catch (e) {
    console.warn('Error reading from localStorage', e);
  }

  // If not in cache or expired, fetch from API
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    
    // Save to cache
    try {
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    } catch (e) {
      console.warn('Error saving to localStorage', e);
    }
    
    return data;
  } catch (error) {
    // If the fetch fails, try to return stale cache as a fallback for resilience
    try {
      const cachedItem = localStorage.getItem(cacheKey);
      if (cachedItem) {
        console.log('Serving stale cache due to network failure');
        const entry: CacheEntry = JSON.parse(cachedItem);
        return entry.data;
      }
    } catch (e) {
      // Ignore
    }
    
    throw error;
  }
};
