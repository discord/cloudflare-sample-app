/**
 * Configuration constants for awwbot
 */

/**
 * Reddit API configuration
 */
export const REDDIT_CONFIG = {
  // Base URL for Reddit API
  API_URL: 'https://www.reddit.com/r/aww/hot.json',

  // User agent for Reddit API requests (required by Reddit)
  USER_AGENT: 'justinbeckwith:awwbot:v1.0.0 (by /u/justinblat)',

  // Minimum score threshold for post quality filtering
  MIN_POST_SCORE: 10,
};

/**
 * Cache configuration
 */
export const CACHE_CONFIG = {
  // Cache Time-To-Live in milliseconds (5 minutes)
  TTL_MS: 5 * 60 * 1000,
};

/**
 * Discord configuration
 */
export const DISCORD_CONFIG = {
  // Discord embed color (Reddit orange)
  EMBED_COLOR: 0xff4500,

  // Maximum response time for Discord interactions (3 seconds)
  MAX_RESPONSE_TIME_MS: 3000,
};

/**
 * Error messages for user-facing errors
 */
export const ERROR_MESSAGES = {
  REDDIT_API_ERROR:
    'Sorry, I encountered an error fetching cute content. Please try again later! 😿',
  NO_POSTS_FOUND: 'No posts found in r/aww',
  NO_VALID_POSTS: 'No valid media posts found in r/aww',
};

/**
 * Success messages for logging
 */
export const LOG_MESSAGES = {
  CACHE_HIT: 'Returning cute post from cache',
  CACHE_MISS: 'Fetching fresh cute posts from Reddit API',
  POSTS_FETCHED: (count) => `Fetched ${count} valid cute posts from Reddit`,
};
