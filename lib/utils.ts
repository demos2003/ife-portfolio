import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateYouTubeThumbnail(url: string): string | null {
  try {
    // Handle different YouTube URL formats
    let videoId = null

    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1]?.split("&")[0]
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0]
    } else if (url.includes("youtube.com/embed/")) {
      videoId = url.split("embed/")[1]?.split("?")[0]
    }

    if (videoId) {
      // Return high quality thumbnail
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }

    return null
  } catch (error) {
    console.error('Error generating YouTube thumbnail:', error)
    return null
  }
}

/**
 * Comprehensive URL parser for social media platforms
 * Handles multiple URL formats and extracts content information
 */
export interface ParsedContentUrl {
  platform: 'youtube' | 'instagram' | 'tiktok' | null
  contentId: string | null
  contentType: 'video' | 'post' | 'reel' | 'short' | null
  embedUrl: string | null
  thumbnailUrl?: string | null
}

/**
 * Parse social media URLs and extract content information
 */
export function parseSocialMediaUrl(url: string): ParsedContentUrl {
  try {
    // YouTube URL patterns
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return parseYouTubeUrl(url)
    }

    // Instagram URL patterns
    if (url.includes('instagram.com')) {
      return parseInstagramUrl(url)
    }

    // TikTok URL patterns
    if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) {
      return parseTikTokUrl(url)
    }

    return {
      platform: null,
      contentId: null,
      contentType: null,
      embedUrl: null
    }
  } catch (error) {
    console.error('Error parsing social media URL:', error)
    return {
      platform: null,
      contentId: null,
      contentType: null,
      embedUrl: null
    }
  }
}

/**
 * Parse YouTube URLs - supports multiple formats
 */
function parseYouTubeUrl(url: string): ParsedContentUrl {
  let videoId: string | null = null
  let contentType: 'video' | 'short' = 'video'

  // youtube.com/watch?v=VIDEO_ID
  if (url.includes('youtube.com/watch?v=')) {
    videoId = url.split('v=')[1]?.split('&')[0] || null
    contentType = url.includes('/shorts/') ? 'short' : 'video'
  }
  // youtu.be/VIDEO_ID
  else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || null
    contentType = 'video'
  }
  // youtube.com/embed/VIDEO_ID
  else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('embed/')[1]?.split('?')[0] || null
    contentType = 'video'
  }
  // youtube.com/shorts/VIDEO_ID
  else if (url.includes('/shorts/')) {
    const match = url.match(/\/shorts\/([^/?]+)/)
    if (match) {
      videoId = match[1]
      contentType = 'short'
    }
  }

  if (!videoId) {
    return {
      platform: 'youtube',
      contentId: null,
      contentType: null,
      embedUrl: null
    }
  }

  return {
    platform: 'youtube',
    contentId: videoId,
    contentType,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }
}

/**
 * Parse Instagram URLs - supports multiple formats
 */
function parseInstagramUrl(url: string): ParsedContentUrl {
  let postId: string | null = null
  let contentType: 'post' | 'reel' = 'post'

  // instagram.com/p/POST_ID
  if (url.includes('/p/')) {
    const match = url.match(/\/p\/([^/?]+)/)
    if (match) {
      postId = match[1]
      contentType = 'post'
    }
  }
  // instagram.com/reel/REEL_ID
  else if (url.includes('/reel/')) {
    const match = url.match(/\/reel\/([^/?]+)/)
    if (match) {
      postId = match[1]
      contentType = 'reel'
    }
  }
  // instagram.com/p/POST_ID/embed
  else if (url.includes('/embed')) {
    const match = url.match(/\/p\/([^/?]+)\/embed/)
    if (match) {
      postId = match[1]
      contentType = 'post'
    }
  }

  if (!postId) {
    return {
      platform: 'instagram',
      contentId: null,
      contentType: null,
      embedUrl: null
    }
  }

  return {
    platform: 'instagram',
    contentId: postId,
    contentType,
    embedUrl: `https://www.instagram.com/p/${postId}/embed`
  }
}

/**
 * Parse TikTok URLs - supports multiple formats
 */
function parseTikTokUrl(url: string): ParsedContentUrl {
  let videoId: string | null = null

  // tiktok.com/@username/video/VIDEO_ID
  if (url.includes('/video/')) {
    const match = url.match(/\/video\/(\d+)/)
    if (match) {
      videoId = match[1]
    }
  }
  // vm.tiktok.com/VIDEO_ID
  else if (url.includes('vm.tiktok.com')) {
    const match = url.match(/vm\.tiktok\.com\/([^/?]+)/)
    if (match) {
      videoId = match[1]
    }
  }
  // tiktok.com/@username/video/VIDEO_ID/embed
  else if (url.includes('/embed')) {
    const match = url.match(/\/video\/(\d+)\/embed/)
    if (match) {
      videoId = match[1]
    }
  }

  if (!videoId) {
    return {
      platform: 'tiktok',
      contentId: null,
      contentType: null,
      embedUrl: null
    }
  }

  return {
    platform: 'tiktok',
    contentId: videoId,
    contentType: 'video',
    embedUrl: null // TikTok doesn't provide public embed URLs like YouTube
  }
}

/**
 * Generate social media embed URL from any supported URL format
 */
export function generateSocialMediaEmbed(url: string): string | null {
  const parsed = parseSocialMediaUrl(url)
  return parsed.embedUrl
}

/**
 * Generate thumbnail URL from any supported URL format
 */
export function generateSocialMediaThumbnail(url: string): string | null {
  const parsed = parseSocialMediaUrl(url)

  // Return thumbnail for YouTube
  if (parsed.platform === 'youtube' && parsed.thumbnailUrl) {
    return parsed.thumbnailUrl
  }

  // Return embed URL for platforms that support embedding
  if (parsed.embedUrl) {
    return parsed.embedUrl
  }

  // Fallback for platforms without public thumbnails/embeds
  if (parsed.platform === 'tiktok' && parsed.contentId) {
    return `https://picsum.photos/400/711?random=${parsed.contentId}&blur=0`
  }

  if (parsed.platform === 'instagram' && parsed.contentId) {
    return `https://picsum.photos/400/500?random=${parsed.contentId}&blur=0`
  }

  return null
}

/**
 * Get content information from URL
 */
export function getContentInfo(url: string): ParsedContentUrl {
  return parseSocialMediaUrl(url)
}

/**
 * Advanced thumbnail generation for social media platforms
 * Note: Instagram and TikTok don't provide public thumbnail URLs like YouTube
 *
 * For production use, consider:
 * 1. Using a service like "embed.ly" or "iframely" to fetch actual thumbnails
 * 2. Implementing server-side thumbnail fetching with proper headers
 * 3. Using platform-specific APIs (requires API keys and rate limiting)
 * 4. Caching thumbnails locally to avoid repeated external requests
 */
