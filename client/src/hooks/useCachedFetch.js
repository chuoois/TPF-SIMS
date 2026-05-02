import { useState, useEffect, useCallback, useRef } from 'react';
import cacheService from '@/services/cache.service';

/**
 * useCachedFetch Hook
 * Implements Stale-While-Revalidate pattern with local cache
 * 
 * @param {string} cacheKey - Unique key for localStorage
 * @param {function} fetchFn - Async function that returns data
 * @param {object} options - { ttl, enabled, onSuccess }
 */
export default function useCachedFetch(cacheKey, fetchFn, options = {}) {
  const { ttl, enabled = true, onSuccess } = options;
  
  const [data, setData] = useState(() => {
    // Phase 1: Try load from cache immediately on init
    if (cacheKey) {
      return cacheService.get(cacheKey);
    }
    return null;
  });
  
  const [isLoading, setIsLoading] = useState(!data);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(async (isBackground = false) => {
    if (!enabled) return;
    
    const currentFetchId = ++fetchIdRef.current;
    
    if (!isBackground) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const result = await fetchFn();
      
      // Prevent race conditions
      if (currentFetchId !== fetchIdRef.current) return;

      // Phase 3: Sync data and update cache
      setData(prevData => {
        // Simple comparison to prevent unnecessary re-renders
        const hasChanged = JSON.stringify(prevData) !== JSON.stringify(result);
        if (hasChanged) {
          if (cacheKey) cacheService.set(cacheKey, result, ttl);
          if (onSuccess) onSuccess(result);
          return result;
        }
        return prevData;
      });
      
      setError(null);
    } catch (err) {
      if (currentFetchId !== fetchIdRef.current) return;
      console.error(`Fetch error [${cacheKey}]:`, err);
      setError(err);
      // If we have cached data, we keep it even if background fetch fails
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [cacheKey, fetchFn, enabled, ttl, onSuccess]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    // Phase 2: Background Fetch
    // If we have cache, it was already set in initial state
    // We always fetch ngầm to ensure data is latest
    fetchData(!!data);
  }, [cacheKey, enabled]); // Only re-fetch if key or enabled status changes

  return {
    data,
    isLoading,
    isRefreshing,
    error,
    refresh: () => fetchData(false),
    mutate: (newData) => {
      setData(newData);
      if (cacheKey) cacheService.set(cacheKey, newData, ttl);
    }
  };
}
