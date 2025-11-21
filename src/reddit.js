import { getFromCache, updateCache, isCacheValid } from './cache.js';

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
  if (postData.score !== undefined && postData.score < 10) {
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
 * Fetches posts from Reddit API with quality filtering.
 * @returns {Promise<Array<string>>} Array of cute post URLs
 * @throws {Error} When Reddit API is unavailable or returns no valid posts
 */
async function fetchFromReddit() {
  const response = await fetch('https://www.reddit.com/r/aww/hot.json', {
    headers: {
      'User-Agent': 'justinbeckwith:awwbot:v1.0.0 (by /u/justinblat)',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Reddit API returned ${response.status}: ${response.statusText}`,
    );
  }

  const data = await response.json();

  if (!data?.data?.children || data.data.children.length === 0) {
    throw new Error('No posts found in r/aww');
  }

  // Filter posts for quality and safety, then extract media URLs
  const posts = data.data.children
    .filter(isValidPost)
    .map(extractMediaUrl)
    .filter((url) => !!url);

  if (posts.length === 0) {
    throw new Error('No valid media posts found in r/aww');
  }

  console.log(`Fetched ${posts.length} valid cute posts from Reddit`);
  return posts;
}

/**
 * Reach out to the reddit API, and get the first page of results from
 * r/aww. Filter out posts without readily available images or videos,
 * and return a random result. Uses caching to reduce API calls.
 * @returns {Promise<string>} The url of an image or video which is cute.
 * @throws {Error} When Reddit API is unavailable or returns no valid posts.
 */
export async function getCuteUrl() {
  try {
    // Try to get from cache first
    if (isCacheValid()) {
      const cachedUrl = getFromCache();
      if (cachedUrl) {
        console.log('Returning cute URL from cache');
        return cachedUrl;
      }
    }

    // Cache miss or expired - fetch from Reddit
    console.log('Fetching fresh cute URLs from Reddit API');
    const posts = await fetchFromReddit();

    // Update cache with fresh posts
    updateCache(posts);

    // Return a random post
    const randomIndex = Math.floor(Math.random() * posts.length);
    return posts[randomIndex];
  } catch (error) {
    console.error('Error fetching cute content from Reddit:', error);
    throw error;
  }
}
