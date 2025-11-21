/**
 * Statistics tracking for the awwbot application.
 * Tracks usage metrics in memory (per Worker instance).
 */

/**
 * Statistics data structure
 * @typedef {Object} Stats
 * @property {number} startTime - When the Worker instance started (ms since epoch)
 * @property {number} totalCommands - Total number of commands processed
 * @property {Object} commandCounts - Count of each command type
 * @property {number} cacheHits - Number of cache hits
 * @property {number} cacheMisses - Number of cache misses
 * @property {number} errors - Number of errors encountered
 * @property {number} timeouts - Number of timeout errors
 * @property {Object} subredditRequests - Count of requests per subreddit
 */

// Global statistics object (persists across requests in the same Worker instance)
const stats = {
  startTime: Date.now(),
  totalCommands: 0,
  commandCounts: {},
  cacheHits: 0,
  cacheMisses: 0,
  errors: 0,
  timeouts: 0,
  subredditRequests: {},
};

/**
 * Records a command execution.
 * @param {string} commandName - Name of the command executed
 */
export function recordCommand(commandName) {
  stats.totalCommands++;
  stats.commandCounts[commandName] = (stats.commandCounts[commandName] || 0) + 1;
}

/**
 * Records a cache hit.
 */
export function recordCacheHit() {
  stats.cacheHits++;
}

/**
 * Records a cache miss.
 */
export function recordCacheMiss() {
  stats.cacheMisses++;
}

/**
 * Records an error.
 * @param {boolean} isTimeout - Whether this was a timeout error
 */
export function recordError(isTimeout = false) {
  stats.errors++;
  if (isTimeout) {
    stats.timeouts++;
  }
}

/**
 * Records a subreddit request.
 * @param {string} subreddit - The subreddit that was requested
 */
export function recordSubredditRequest(subreddit) {
  stats.subredditRequests[subreddit] =
    (stats.subredditRequests[subreddit] || 0) + 1;
}

/**
 * Gets the current statistics.
 * @returns {Stats} Current statistics object
 */
export function getStats() {
  return {
    ...stats,
    uptime: Date.now() - stats.startTime,
  };
}

/**
 * Calculates the cache hit rate as a percentage.
 * @returns {number} Cache hit rate (0-100)
 */
export function getCacheHitRate() {
  const total = stats.cacheHits + stats.cacheMisses;
  if (total === 0) return 0;
  return ((stats.cacheHits / total) * 100).toFixed(1);
}

/**
 * Resets all statistics (useful for testing).
 */
export function resetStats() {
  stats.startTime = Date.now();
  stats.totalCommands = 0;
  stats.commandCounts = {};
  stats.cacheHits = 0;
  stats.cacheMisses = 0;
  stats.errors = 0;
  stats.timeouts = 0;
  stats.subredditRequests = {};
}

/**
 * Formats uptime in a human-readable format.
 * @param {number} uptimeMs - Uptime in milliseconds
 * @returns {string} Formatted uptime string
 */
export function formatUptime(uptimeMs) {
  const seconds = Math.floor(uptimeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}
