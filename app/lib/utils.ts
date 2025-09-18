/**
 * Utility functions for the online resume application
 */

/**
 * Extracts tweet ID from Twitter/X URL
 * @param url - The tweet URL from twitter.com or x.com
 * @returns The tweet ID string or null if invalid URL
 */
export function extractTweetId(url: string): string | null {
  if (!url) return null
  const regex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/
  const match = url.match(regex)
  return match ? match[1] : null
}
