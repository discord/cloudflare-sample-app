import { CACHE_CONFIG, REDDIT_CONFIG } from './config.js';

/**
 * Simple in-memory cache for Cloudflare Workers.
 * Stores Reddit posts temporarily to reduce API calls.
 * Supports caching posts from multiple subreddits separately.
 */

/**
 * Cache entry structure
 * @typedef {Object} CacheEntry
 * @property {Array<Object>} posts - Array of cute post objects
 * @property {number} timestamp - When the cache was created (ms since epoch)
 */

// Global cache Map (persists across requests in the same Worker instance)
// Key: subreddit name, Value: CacheEntry
const cacheMap = new Map();

/**
 * Checks if the cache for a specific subreddit is still valid (not expired).
 * @param {string} [subreddit] - The subreddit to check (defaults to 'aww')
 * @returns {boolean} True if cache is valid and not expired
 */
export function isCacheValid(subreddit = REDDIT_CONFIG.DEFAULT_SUBREDDIT) {
  const cache = cacheMap.get(subreddit);
  if (!cache) {
    return false;
  }

  const now = Date.now();
  const hasData = cache.posts && cache.posts.length > 0;
  const notExpired = now - cache.timestamp < CACHE_CONFIG.TTL_MS;
  return hasData && notExpired;
}

/**
 * Gets a random post from the cache for a specific subreddit.
 * @param {string} [subreddit] - The subreddit to get from (defaults to 'aww')
 * @returns {Object|null} A random cute post object from cache, or null if cache is empty
 */
export function getFromCache(subreddit = REDDIT_CONFIG.DEFAULT_SUBREDDIT) {
  if (!isCacheValid(subreddit)) {
    return null;
  }

  const cache = cacheMap.get(subreddit);
  const randomIndex = Math.floor(Math.random() * cache.posts.length);
  return cache.posts[randomIndex];
}

/**
 * Updates the cache with new posts for a specific subreddit.
 * @param {Array<Object>} posts - Array of cute post objects to cache
 * @param {string} [subreddit] - The subreddit to cache for (defaults to 'aww')
 */
export function updateCache(posts, subreddit = REDDIT_CONFIG.DEFAULT_SUBREDDIT) {
  cacheMap.set(subreddit, {
    posts: posts || [],
    timestamp: Date.now(),
  });
}

/**
 * Clears the cache for all subreddits (useful for testing).
 */
export function clearCache() {
  cacheMap.clear();
}

/**
 * Clears the cache for a specific subreddit (useful for testing).
 * @param {string} subreddit - The subreddit cache to clear
 */
export function clearCacheForSubreddit(subreddit) {
  cacheMap.delete(subreddit);
}
