// Privacy Redirector - YouTube to Piped, Reddit to custom instances
// With customizable URLs

// Default URLs
const DEFAULT_PIPED_URL = 'https://piped.withmilo.xyz';
const DEFAULT_REDDIT_URL = 'https://reddit.withmilo.xyz';

// Get stored settings or use defaults
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({
      pipedUrl: DEFAULT_PIPED_URL,
      redditUrl: DEFAULT_REDDIT_URL
    }, resolve);
  });
}

// Function to extract video ID from various YouTube URL formats
function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
}

// Function to extract playlist ID from YouTube URLs
function extractPlaylistId(url) {
  const match = url.match(/[?&]list=([^&\n?#]+)/);
  return match ? match[1] : null;
}

// Function to build redirect URL based on platform
async function buildRedirectUrl(originalUrl) {
  const settings = await getSettings();
  
  // YouTube redirects
  if (isYouTubeUrl(originalUrl)) {
    return buildPipedUrl(originalUrl, settings.pipedUrl);
  }
  
  // Reddit redirects
  if (isRedditUrl(originalUrl)) {
    return buildRedditUrl(originalUrl, settings.redditUrl);
  }
  
  return null;
}

// Check if URL is YouTube
function isYouTubeUrl(url) {
  return /^https?:\/\/(www\.|m\.)?youtube\.com\//.test(url) || 
         /^https?:\/\/youtu\.be\//.test(url);
}

// Check if URL is Reddit
function isRedditUrl(url) {
  return /^https?:\/\/(www\.|old\.|new\.)?reddit\.com\//.test(url);
}

// Function to build Reddit URL with custom instance
function buildRedditUrl(originalUrl, redditInstance) {
  // Remove trailing slash from instance URL if present
  const cleanInstance = redditInstance.replace(/\/$/, '');
  
  // Replace reddit domain with custom instance
  return originalUrl.replace(/^https?:\/\/(www\.|old\.|new\.)?reddit\.com/, cleanInstance);
}
// Function to build Piped URL with custom instance
function buildPipedUrl(originalUrl, pipedInstance) {
  // Remove trailing slash from instance URL if present
  const cleanInstance = pipedInstance.replace(/\/$/, '');
  
  const videoId = extractVideoId(originalUrl);
  const playlistId = extractPlaylistId(originalUrl);
  
  let pipedUrl = cleanInstance;
  
  if (videoId) {
    pipedUrl += '/watch?v=' + videoId;
    
    // Add playlist parameter if present
    if (playlistId) {
      pipedUrl += '&list=' + playlistId;
    }
    
    // Preserve timestamp if present
    const timeMatch = originalUrl.match(/[?&]t=([^&\n?#]+)/);
    if (timeMatch) {
      pipedUrl += '&t=' + timeMatch[1];
    }
  } else if (playlistId) {
    // Handle playlist-only URLs
    pipedUrl += '/playlist?list=' + playlistId;
  } else if (originalUrl.includes('/channel/') || originalUrl.includes('/c/') || originalUrl.includes('/user/')) {
    // Handle channel URLs - extract channel identifier
    const channelMatch = originalUrl.match(/\/(channel|c|user)\/([^/?]+)/);
    if (channelMatch) {
      pipedUrl += '/channel/' + channelMatch[2];
    }
  } else {
    // Default to home page if no specific content identified
    pipedUrl += '/';
  }
  
  return pipedUrl;
}

// Function to remove URLs from history
function removeFromHistory(url) {
  chrome.history.deleteUrl({ url: url }, function() {
    if (chrome.runtime.lastError) {
      console.log('Error removing from history:', chrome.runtime.lastError);
    } else {
      console.log('Removed from history:', url);
    }
  });
}

// Set up request blocking/redirecting
chrome.webRequest.onBeforeRequest.addListener(
  async function(details) {
    const originalUrl = details.url;
    
    // Skip if it's already a privacy-friendly URL or not a main frame request
    const settings = await getSettings();
    if ((originalUrl.includes(settings.pipedUrl.replace(/^https?:\/\//, '')) || 
         originalUrl.includes(settings.redditUrl.replace(/^https?:\/\//, ''))) || 
         details.type !== 'main_frame') {
      return;
    }
    
    // Check if it's a URL we want to redirect
    const redirectUrl = await buildRedirectUrl(originalUrl);
    
    if (redirectUrl) {
      
      // Remove the original YouTube URL from history after a short delay
      // We need a delay because the history entry might not exist yet
      setTimeout(() => {
        removeFromHistory(originalUrl);
      }, 1000);
      
      console.log('Redirecting:', originalUrl, '->', redirectUrl);
      
      return {
        redirectUrl: redirectUrl
      };
    }
  },
  {
    urls: [
      "*://youtube.com/*",
      "*://www.youtube.com/*",
      "*://youtu.be/*",
      "*://m.youtube.com/*",
      "*://reddit.com/*",
      "*://www.reddit.com/*",
      "*://old.reddit.com/*",
      "*://new.reddit.com/*"
    ]
  },
  ["blocking"]
);

// Alternative approach: Listen for navigation completed and clean up history
chrome.webNavigation.onCompleted.addListener(async function(details) {
  if (details.frameId === 0) { // Main frame only
    const url = details.url;
    const settings = await getSettings();
    
    // If we successfully navigated to a privacy-friendly URL, clean up original URLs from history
    if (url.includes(settings.pipedUrl.replace(/^https?:\/\//, '')) || 
        url.includes(settings.redditUrl.replace(/^https?:\/\//, ''))) {
      // Search for recent original URLs in history and remove them
      const searchPatterns = [
        'youtube.com',
        'youtu.be',
        'reddit.com'
      ];
      
      searchPatterns.forEach(pattern => {
        chrome.history.search({
          text: pattern,
          maxResults: 10,
          startTime: Date.now() - (5 * 60 * 1000) // Last 5 minutes
        }, function(results) {
          results.forEach(item => {
            if (item.url.includes(pattern)) {
              removeFromHistory(item.url);
            }
          });
        });
      });
    }
  }
});

// Optional: Block ALL YouTube requests (images, scripts, etc.) - uncomment if desired
/*
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = details.url;
    
    // Block any request to YouTube domains (except if already on Piped)
    if ((url.includes('youtube.com') || url.includes('youtu.be')) && 
        !url.includes('piped')) {
      console.log('Blocking YouTube resource:', url);
      return { cancel: true };
    }
  },
  {
    urls: [
      "*://youtube.com/*",
      "*://www.youtube.com/*", 
      "*://youtu.be/*",
      "*://m.youtube.com/*",
      "*://*.youtube.com/*",
      "*://*.youtu.be/*"
    ]
  },
  ["blocking"]
);
*/

console.log('Privacy Redirector loaded - Customizable YouTube->Piped, Reddit instances');
