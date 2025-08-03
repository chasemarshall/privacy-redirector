// YouTube to Piped redirector background script

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
    
    // Skip if it's already a Piped URL or not a main frame request
    if (originalUrl.includes('piped.withmilo.xyz') || details.type !== 'main_frame') {
      return;
    }
    
    // Check if it's a YouTube URL we want to redirect
    const isYouTubeUrl = /^https?:\/\/(www\.|m\.)?youtube\.com\//.test(originalUrl) || 
                        /^https?:\/\/youtu\.be\//.test(originalUrl);
    
    if (isYouTubeUrl) {
      const pipedUrl = buildPipedUrl(originalUrl);
      
      // Remove the original YouTube URL from history after a short delay
      // We need a delay because the history entry might not exist yet
      setTimeout(() => {
        removeFromHistory(originalUrl);
      }, 1000);
      
      console.log('Redirecting:', originalUrl, '->', pipedUrl);
      
      return {
        redirectUrl: pipedUrl
      };
    }
  },
  {
    urls: [
      "*://youtube.com/*",
      "*://www.youtube.com/*",
      "*://youtu.be/*",
      "*://m.youtube.com/*"
    ]
  },
  ["blocking"]
);

// Alternative approach: Listen for navigation completed and clean up history
chrome.webNavigation.onCompleted.addListener(function(details) {
  if (details.frameId === 0) { // Main frame only
    const url = details.url;
    
    // If we successfully navigated to a Piped URL, clean up any YouTube URLs from history
    if (url.includes('piped.withmilo.xyz')) {
      // Search for recent YouTube URLs in history and remove them
      const searchPatterns = [
        'youtube.com',
        'youtu.be'
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

console.log('YouTube to Piped redirector loaded');
