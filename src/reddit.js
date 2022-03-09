/**
 * Reach out to the reddit API, and get the first page of results from
 * r/aww. Filter out posts without readily available images or videos,
 * and return a random result.
 * @returns The url of an image or video which is cute.
 */
export async function getCuteUrl() {
  const response = await fetch('https://www.reddit.com/r/aww/hot.json', {
    headers: {
      'User-Agent': 'justinbeckwith:awwbot:v1.0.0 (by /u/justinblat)',
    },
  });
  const data = await response.json();
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
  const randomIndex = Math.floor(Math.random() * posts.length);
  const randomPost = posts[randomIndex];
  return randomPost;
}
