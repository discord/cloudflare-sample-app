/**
 * Reach out to the reddit API, and get the first page of results from
 * r/aww. Filter out posts without readily available images or videos,
 * and return a random result.
 * @returns {Promise<string>} The url of an image or video which is cute.
 * @throws {Error} When Reddit API is unavailable or returns no valid posts.
 */
export async function getCuteUrl() {
  try {
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

    const posts = data.data.children
      .map((post) => {
        if (post.is_gallery) {
          return '';
        }
        return (
          post.data?.media?.reddit_video?.fallback_url ||
          post.data?.secure_media?.reddit_video?.fallback_url ||
          post.data?.url
        );
      })
      .filter((post) => !!post);

    if (posts.length === 0) {
      throw new Error('No valid media posts found in r/aww');
    }

    const randomIndex = Math.floor(Math.random() * posts.length);
    const randomPost = posts[randomIndex];
    return randomPost;
  } catch (error) {
    console.error('Error fetching cute content from Reddit:', error);
    throw error;
  }
}
