import { getFromCache, updateCache, isCacheValid } from './cache.js';
import { REDDIT_CONFIG, ERROR_MESSAGES, getRedditUrl } from './config.js';
import logger from './logger.js';

/**
 * Checks if a Reddit post is safe and suitable for display.
 * @param {Object} post - Reddit post object from API
 * @returns {boolean} True if post passes all quality checks
 */
function isValidPost(post) {
  const postData = post.data;

  // Filter out NSFW content
  if (postData.over_18) {
    return false;
  }

  // Filter out removed or deleted posts
  if (postData.removed || postData.author === '[deleted]') {
    return false;
  }

  // Filter out gallery posts (not easily displayable)
  if (post.is_gallery) {
    return false;
  }

  // Filter out posts with very low scores (likely spam or low quality)
  if (
    postData.score !== undefined &&
    postData.score < REDDIT_CONFIG.MIN_POST_SCORE
  ) {
    return false;
  }

  // Must have a valid URL or video
  const hasMedia =
    postData?.media?.reddit_video?.fallback_url ||
    postData?.secure_media?.reddit_video?.fallback_url ||
    postData?.url;

  return !!hasMedia;
}

/**
 * Extracts the media URL from a Reddit post.
 * @param {Object} post - Reddit post object from API
 * @returns {string} The media URL (video or image)
 */
function extractMediaUrl(post) {
  const postData = post.data;

  // Priority 1: Reddit video (most reliable for videos)
  if (postData?.media?.reddit_video?.fallback_url) {
    return postData.media.reddit_video.fallback_url;
  }

  // Priority 2: Secure media video
  if (postData?.secure_media?.reddit_video?.fallback_url) {
    return postData.secure_media.reddit_video.fallback_url;
  }

  // Priority 3: Direct URL (images, gifs, external videos)
  return postData.url;
}

/**
 * Extracts post metadata for creating rich embeds.
 * @param {Object} post - Reddit post object from API
 * @returns {Object} Post metadata including url, title, author, score, permalink
 */
function extractPostData(post) {
  const postData = post.data;

  return {
    url: extractMediaUrl(post),
    title: postData.title || 'Cute post from r/aww',
    author: postData.author || 'Unknown',
    score: postData.score || 0,
    permalink: `https://reddit.com${postData.permalink}`,
    subreddit: postData.subreddit || 'aww',
  };
}

/**
 * Fetches posts from Reddit API with quality filtering.
 * @param {string} [subreddit] - The subreddit to fetch from (defaults to 'aww')
 * @returns {Promise<Array<Object>>} Array of post objects with metadata
 * @throws {Error} When Reddit API is unavailable or returns no valid posts
 */
async function fetchFromReddit(subreddit = REDDIT_CONFIG.DEFAULT_SUBREDDIT) {
  const apiUrl = getRedditUrl(subreddit);
  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': REDDIT_CONFIG.USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Reddit API returned ${response.status}: ${response.statusText}`,
    );
  }

  const data = await response.json();

  if (!data?.data?.children || data.data.children.length === 0) {
    throw new Error(ERROR_MESSAGES.NO_POSTS_FOUND);
  }

  // Filter posts for quality and safety, then extract post data
  const posts = data.data.children
    .filter(isValidPost)
    .map(extractPostData)
    .filter((post) => !!post.url);

  if (posts.length === 0) {
    throw new Error(ERROR_MESSAGES.NO_VALID_POSTS);
  }

  logger.info('Fetched posts from Reddit', {
    count: posts.length,
    source: `r/${subreddit}`
  });
  return posts;
}

/**
 * Reach out to the reddit API, and get a random cute post with metadata.
 * Uses caching to reduce API calls.
 * @param {string} [subreddit] - The subreddit to fetch from (defaults to 'aww')
 * @returns {Promise<Object>} Post object with url, title, author, score, permalink
 * @throws {Error} When Reddit API is unavailable or returns no valid posts.
 */
export async function getCutePost(subreddit = REDDIT_CONFIG.DEFAULT_SUBREDDIT) {
  const timer = logger.startTimer('reddit_fetch');
  try {
    // Try to get from cache first
    if (isCacheValid(subreddit)) {
      const cachedPost = getFromCache(subreddit);
      if (cachedPost) {
        logger.info('Cache hit - returning cached post', {
          cacheSource: 'memory',
          subreddit: `r/${subreddit}`,
          postTitle: cachedPost.title
        });
        timer.end({ cacheHit: true, subreddit });
        return cachedPost;
      }
    }

    // Cache miss or expired - fetch from Reddit
    logger.info('Cache miss - fetching from Reddit API', {
      cacheSource: 'memory',
      subreddit: `r/${subreddit}`
    });
    const posts = await fetchFromReddit(subreddit);

    // Update cache with fresh posts
    updateCache(posts, subreddit);

    // Return a random post
    const randomIndex = Math.floor(Math.random() * posts.length);
    const selectedPost = posts[randomIndex];
    timer.end({ cacheHit: false, subreddit, postTitle: selectedPost.title });
    return selectedPost;
  } catch (error) {
    timer.end({ success: false, subreddit });
    logger.error('Error fetching cute content from Reddit', {
      error,
      operation: 'getCutePost',
      subreddit: `r/${subreddit}`
    });
    throw error;
  }
}

/**
 * Get just the URL of a cute post (backward compatibility wrapper).
 * @returns {Promise<string>} The url of an image or video which is cute.
 * @throws {Error} When Reddit API is unavailable or returns no valid posts.
 */
export async function getCuteUrl() {
  const post = await getCutePost();
  return post.url;
}
