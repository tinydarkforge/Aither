/**
 * Aither - QR Code Manager for Video Content
 *
 * Copyright (c) 2025 TinyDarkForge. All rights reserved.
 * Licensed under MIT - see LICENSE file
 *
 * Directory Parser Module
 * Extracts MP4 file URLs from directory listing pages
 */

/**
 * Parse a directory listing URL and extract all MP4 file URLs
 * @param {string} directoryUrl - The URL of the directory listing
 * @returns {Promise<{success: boolean, mp4Urls?: string[], error?: string}>}
 */
export async function parseDirectoryForMP4s(directoryUrl) {
  try {
    // Validate URL
    try {
      new URL(directoryUrl);
    } catch {
      return { success: false, error: 'Invalid URL format' };
    }

    // Fetch the directory listing page
    const response = await fetch(directoryUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml'
      }
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch directory: ${response.status} ${response.statusText}`
      };
    }

    const html = await response.text();

    // Extract MP4 URLs from the HTML
    const mp4Urls = extractMP4UrlsFromHTML(html, directoryUrl);

    if (mp4Urls.length === 0) {
      return {
        success: false,
        error: 'No MP4 files found in the directory listing'
      };
    }

    return {
      success: true,
      mp4Urls: mp4Urls
    };
  } catch (error) {
    console.error('Error parsing directory:', error);

    // Check for CORS error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Unable to access the URL. This may be due to CORS restrictions. Please ensure the URL is publicly accessible and allows cross-origin requests.'
      };
    }

    return {
      success: false,
      error: `Error: ${error.message}`
    };
  }
}

/**
 * Extract MP4 URLs from HTML content
 * @param {string} html - HTML content
 * @param {string} baseUrl - Base URL for resolving relative paths
 * @returns {string[]} Array of absolute MP4 URLs
 */
function extractMP4UrlsFromHTML(html, baseUrl) {
  const mp4Urls = new Set();
  const base = new URL(baseUrl);

  // Pattern 1: Look for <a> tags with .mp4 href
  // Matches: <a href="video.mp4">
  const linkPattern = /<a\s+[^>]*href=["']([^"']*\.mp4[^"']*)["'][^>]*>/gi;
  let match;

  while ((match = linkPattern.exec(html)) !== null) {
    const href = match[1];
    try {
      const absoluteUrl = new URL(href, base).href;
      mp4Urls.add(absoluteUrl);
    } catch {
      console.warn('Invalid URL:', href);
    }
  }

  // Pattern 2: Look for direct .mp4 URLs in the text
  // Matches: http://example.com/video.mp4 or https://example.com/video.mp4
  const urlPattern = /https?:\/\/[^\s<>"]+\.mp4/gi;
  const urlMatches = html.match(urlPattern);

  if (urlMatches) {
    urlMatches.forEach(url => {
      try {
        mp4Urls.add(new URL(url).href);
      } catch {
        console.warn('Invalid URL:', url);
      }
    });
  }

  // Pattern 3: Look for <video> tags with src attribute
  // Matches: <video src="video.mp4">
  const videoPattern = /<video\s+[^>]*src=["']([^"']*\.mp4[^"']*)["'][^>]*>/gi;

  while ((match = videoPattern.exec(html)) !== null) {
    const src = match[1];
    try {
      const absoluteUrl = new URL(src, base).href;
      mp4Urls.add(absoluteUrl);
    } catch {
      console.warn('Invalid URL:', src);
    }
  }

  // Pattern 4: Look for <source> tags with src attribute
  // Matches: <source src="video.mp4" type="video/mp4">
  const sourcePattern = /<source\s+[^>]*src=["']([^"']*\.mp4[^"']*)["'][^>]*>/gi;

  while ((match = sourcePattern.exec(html)) !== null) {
    const src = match[1];
    try {
      const absoluteUrl = new URL(src, base).href;
      mp4Urls.add(absoluteUrl);
    } catch {
      console.warn('Invalid URL:', src);
    }
  }

  return Array.from(mp4Urls).sort();
}

/**
 * Validate that a URL points to an MP4 file
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL ends with .mp4
 */
export function isMP4URL(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.toLowerCase().endsWith('.mp4');
  } catch {
    return false;
  }
}

/**
 * Get filename from URL
 * @param {string} url - URL to extract filename from
 * @returns {string} Filename or 'unknown'
 */
export function getFilenameFromURL(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    return filename || 'unknown.mp4';
  } catch {
    return 'unknown.mp4';
  }
}
