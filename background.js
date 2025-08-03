// Privacy Redirector - YouTube to Piped, Reddit to Redlib

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
function buildRedirectUrl(originalUrl) {
  // YouTube redirects
  if (isYouTubeUrl(originalUrl)) {
    return buildPipedUrl(originalUrl);
  }
  
  // Reddit redirects
  if (isRedditUrl(originalUrl)) {
    return buildRedlibUrl(originalUrl);
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

// Function to build Reddit -> Redlib URL
function buildRedlibUrl(originalUrl) {
  // Replace reddit domain with redlib
  return originalUrl.replace(/^https?:\/\/(www\.|old\.|new\.)?reddit\.com/, 'https://redlib.withmilo.xyz');
}
// Function to build Piped URL
function buildPipedUrl(originalUrl) {
  const videoId = extractVideoId(originalUrl);
  const playlistId = extractPlaylistId(originalUrl);
  
  let pipedUrl = 'https://piped.withmilo.xyz';
  
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
  function(details) {
    const originalUrl = details.url;
    
    // Skip if it's already a privacy-friendly URL or not a main frame request
    if ((originalUrl.includes('piped.withmilo.xyz') || 
         originalUrl.includes('redlib.withmilo.xyz')) || 
         details.type !== 'main_frame') {
      return;
    }
    
    // Check if it's a URL we want to redirect
    const redirectUrl = buildRedirectUrl(originalUrl);
    
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
chrome.webNavigation.onCompleted.addListener(function(details) {
  if (details.frameId === 0) { // Main frame only
    const url = details.url;
    
    // If we successfully navigated to a privacy-friendly URL, clean up original URLs from history
    if (url.includes('piped.withmilo.xyz') || url.includes('redlib.withmilo.xyz')) {
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

console.log('Privacy Redirector loaded - YouTube->Piped, Reddit->Redlib');
