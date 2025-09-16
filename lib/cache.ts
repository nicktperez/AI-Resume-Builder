// Simple in-memory cache (for production, use Redis)
interface CacheEntry<T> {
  value: T;
  expires: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, value: T, ttlMs: number = 5 * 60 * 1000): void {
    const expires = Date.now() + ttlMs;
    this.cache.set(key, { value, expires });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

const cache = new MemoryCache();

// Clean up expired entries every 5 minutes
setInterval(() => {
  cache.cleanup();
}, 5 * 60 * 1000);

export default cache;

// Cache key generators
export const cacheKeys = {
  userSession: (userId: string) => `user:session:${userId}`,
  resumeGeneration: (userId: string, hash: string) => `resume:generation:${userId}:${hash}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  pricingData: () => 'pricing:data'
};

// Cache TTL constants
export const cacheTTL = {
  userSession: 30 * 60 * 1000, // 30 minutes
  resumeGeneration: 60 * 60 * 1000, // 1 hour
  userProfile: 15 * 60 * 1000, // 15 minutes
  pricingData: 24 * 60 * 60 * 1000 // 24 hours
};
