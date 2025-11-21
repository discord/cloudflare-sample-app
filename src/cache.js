/**
 * Simple in-memory cache for Cloudflare Workers.
 * Stores Reddit posts temporarily to reduce API calls.
 */

/**
 * Cache entry structure
 * @typedef {Object} CacheEntry
 * @property {Array<string>} posts - Array of cute post URLs
 * @property {number} timestamp - When the cache was created (ms since epoch)
 */

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

// Global cache object (persists across requests in the same Worker instance)
let cache = {
  posts: [],
  timestamp: 0,
};

/**
 * Checks if the cache is still valid (not expired).
 * @returns {boolean} True if cache is valid and not expired
 */
export function isCacheValid() {
  const now = Date.now();
  const hasData = cache.posts && cache.posts.length > 0;
  const notExpired = now - cache.timestamp < CACHE_TTL;
  return hasData && notExpired;
}

/**
 * Gets a random post from the cache.
 * @returns {string|null} A random cute URL from cache, or null if cache is empty
 */
export function getFromCache() {
  if (!isCacheValid()) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * cache.posts.length);
  return cache.posts[randomIndex];
}

/**
 * Updates the cache with new posts.
 * @param {Array<string>} posts - Array of cute post URLs to cache
 */
export function updateCache(posts) {
  cache = {
    posts: posts || [],
    timestamp: Date.now(),
  };
}

/**
 * Clears the cache (useful for testing).
 */
export function clearCache() {
  cache = {
    posts: [],
    timestamp: 0,
  };
}
