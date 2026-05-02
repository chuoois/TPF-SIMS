/**
 * Cache Service
 * Handles local storage caching with TTL (Time To Live)
 */

const DEFAULT_TTL = 1000 * 60 * 15; // 15 minutes

const cacheService = {
  /**
   * Set data to cache
   * @param {string} key 
   * @param {any} data 
   * @param {number} ttl 
   */
  set(key, data, ttl = DEFAULT_TTL) {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  /**
   * Get data from cache
   * @param {string} key 
   * @returns {any|null}
   */
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const cacheData = JSON.parse(raw);
      const isExpired = Date.now() - cacheData.timestamp > cacheData.ttl;

      if (isExpired) {
        localStorage.removeItem(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Cache get error:', error);
      localStorage.removeItem(key);
      return null;
    }
  },

  /**
   * Remove specific cache
   * @param {string} key 
   */
  remove(key) {
    localStorage.removeItem(key);
  },

  /**
   * Clear all cache starting with prefix
   * @param {string} prefix 
   */
  clearWithPrefix(prefix) {
    Object.keys(localStorage)
      .filter(key => key.startsWith(prefix))
      .forEach(key => localStorage.removeItem(key));
  }
};

export default cacheService;
