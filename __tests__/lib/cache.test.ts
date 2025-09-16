import cache, { cacheKeys, cacheTTL } from '../../lib/cache';

describe('Cache utilities', () => {
  beforeEach(() => {
    cache.clear();
  });

  describe('Basic cache operations', () => {
    it('should set and get values', () => {
      cache.set('test-key', 'test-value', 1000);
      expect(cache.get('test-key')).toBe('test-value');
    });

    it('should return null for non-existent keys', () => {
      expect(cache.get('non-existent')).toBeNull();
    });

    it('should handle different data types', () => {
      const testObject = { name: 'test', value: 123 };
      const testArray = [1, 2, 3];
      
      cache.set('object-key', testObject, 1000);
      cache.set('array-key', testArray, 1000);
      
      expect(cache.get('object-key')).toEqual(testObject);
      expect(cache.get('array-key')).toEqual(testArray);
    });
  });

  describe('Cache expiration', () => {
    it('should return null for expired entries', (done) => {
      cache.set('expired-key', 'test-value', 100); // 100ms TTL
      
      setTimeout(() => {
        expect(cache.get('expired-key')).toBeNull();
        done();
      }, 150);
    });

    it('should return value before expiration', (done) => {
      cache.set('valid-key', 'test-value', 1000); // 1000ms TTL
      
      setTimeout(() => {
        expect(cache.get('valid-key')).toBe('test-value');
        done();
      }, 100);
    });
  });

  describe('Cache management', () => {
    it('should delete specific keys', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should clear all entries', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      
      cache.clear();
      
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });

    it('should provide cache stats', () => {
      cache.set('key1', 'value1', 1000);
      cache.set('key2', 'value2', 1000);
      
      const stats = cache.getStats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
  });

  describe('Cache key generators', () => {
    it('should generate correct cache keys', () => {
      expect(cacheKeys.userSession('user123')).toBe('user:session:user123');
      expect(cacheKeys.resumeGeneration('user123', 'hash456')).toBe('resume:generation:user123:hash456');
      expect(cacheKeys.userProfile('user123')).toBe('user:profile:user123');
      expect(cacheKeys.pricingData()).toBe('pricing:data');
    });
  });

  describe('Cache TTL constants', () => {
    it('should have reasonable TTL values', () => {
      expect(cacheTTL.userSession).toBe(30 * 60 * 1000); // 30 minutes
      expect(cacheTTL.resumeGeneration).toBe(60 * 60 * 1000); // 1 hour
      expect(cacheTTL.userProfile).toBe(15 * 60 * 1000); // 15 minutes
      expect(cacheTTL.pricingData).toBe(24 * 60 * 60 * 1000); // 24 hours
    });
  });
});
