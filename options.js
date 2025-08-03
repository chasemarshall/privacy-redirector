// Options page script for Privacy Redirector (Firefox compatible with fallback)

// Default URLs
const DEFAULT_PIPED_URL = 'https://piped.withmilo.xyz';
const DEFAULT_REDDIT_URL = 'https://reddit.withmilo.xyz';
const DEFAULT_BLOCK_ALL = false;

// Check if storage is available
async function isStorageAvailable() {
  try {
    await browser.storage.sync.get();
    return true;
  } catch (error) {
    return false;
  }
}

// Load saved settings (Firefox compatible with fallback)
async function loadSettings() {
  const storageAvailable = await isStorageAvailable();
  
  if (!storageAvailable) {
    // Show warning about temporary addon
    showStatus('⚠️ Settings cannot be saved in temporary add-on mode. Install as .xpi for persistent settings.', false, 10000);
    // Load defaults
    document.getElementById('pipedUrl').value = DEFAULT_PIPED_URL;
    document.getElementById('redditUrl').value = DEFAULT_REDDIT_URL;
    document.getElementById('blockAllYoutube').checked = DEFAULT_BLOCK_ALL;
    return;
  }

  try {
    const items = await browser.storage.sync.get({
      pipedUrl: DEFAULT_PIPED_URL,
      redditUrl: DEFAULT_REDDIT_URL,
      blockAllYoutube: DEFAULT_BLOCK_ALL
    });
    
    document.getElementById('pipedUrl').value = items.pipedUrl;
    document.getElementById('redditUrl').value = items.redditUrl;
    document.getElementById('blockAllYoutube').checked = items.blockAllYoutube;
  } catch (error) {
    console.log('Error loading settings:', error);
    // Use defaults if loading fails
    document.getElementById('pipedUrl').value = DEFAULT_PIPED_URL;
    document.getElementById('redditUrl').value = DEFAULT_REDDIT_URL;
    document.getElementById('blockAllYoutube').checked = DEFAULT_BLOCK_ALL;
  }
}

// Save settings (Firefox compatible with fallback)
async function saveSettings() {
  const pipedUrl = document.getElementById('pipedUrl').value.trim();
  const redditUrl = document.getElementById('redditUrl').value.trim();
  const blockAllYoutube = document.getElementById('blockAllYoutube').checked;
  
  // Validate URLs
  if (!isValidUrl(pipedUrl) || !isValidUrl(redditUrl)) {
    showStatus('Please enter valid URLs (including https://)', false);
    return;
  }
  
  const storageAvailable = await isStorageAvailable();
  
  if (!storageAvailable) {
    showStatus('⚠️ Cannot save settings in temporary add-on mode. Settings will work for this session only. Install as .xpi for persistent settings.', false, 8000);
    
    // Send settings to background script via runtime messaging
    if (browser.runtime && browser.runtime.sendMessage) {
      try {
        await browser.runtime.sendMessage({
          action: 'updateSettings',
          settings: {
            pipedUrl: pipedUrl,
            redditUrl: redditUrl,
            blockAllYoutube: blockAllYoutube
          }
        });
        console.log('Settings sent to background script');
      } catch (error) {
        console.log('Could not send settings to background script:', error);
      }
    }
    return;
  }

  try {
    await browser.storage.sync.set({
      pipedUrl: pipedUrl,
      redditUrl: redditUrl,
      blockAllYoutube: blockAllYoutube
    });
    showStatus('Settings saved successfully!', true);
  } catch (error) {
    showStatus('Error saving settings: ' + error.message, false);
  }
}

// Reset to defaults (Firefox compatible with fallback)
async function resetSettings() {
  document.getElementById('pipedUrl').value = DEFAULT_PIPED_URL;
  document.getElementById('redditUrl').value = DEFAULT_REDDIT_URL;
  document.getElementById('blockAllYoutube').checked = DEFAULT_BLOCK_ALL;
  
  const storageAvailable = await isStorageAvailable();
  
  if (!storageAvailable) {
    showStatus('Settings reset for this session only (temporary add-on mode)', false, 5000);
    return;
  }

  try {
    await browser.storage.sync.set({
      pipedUrl: DEFAULT_PIPED_URL,
      redditUrl: DEFAULT_REDDIT_URL,
      blockAllYoutube: DEFAULT_BLOCK_ALL
    });
    showStatus('Settings reset to defaults!', true);
  } catch (error) {
    showStatus('Error resetting settings: ' + error.message, false);
  }
}

// Validate URL format
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// Show status message with custom duration
function showStatus(message, isSuccess, duration = 3000) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = 'status ' + (isSuccess ? 'success' : 'error');
  status.style.display = 'block';
  
  // Hide after specified duration
  setTimeout(() => {
    status.style.display = 'none';
  }, duration);
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadSettings);

document.getElementById('settingsForm').addEventListener('submit', function(e) {
  e.preventDefault();
  saveSettings();
});

document.getElementById('resetBtn').addEventListener('click', function(e) {
  e.preventDefault();
  if (confirm('Are you sure you want to reset to default settings?')) {
    resetSettings();
  }
});

// Auto-save on input change (with debounce) - only if storage available
let saveTimeout;
document.querySelectorAll('input[type="url"], input[type="checkbox"]').forEach(input => {
  input.addEventListener('input', function() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      const storageAvailable = await isStorageAvailable();
      if (storageAvailable) {
        saveSettings();
      }
    }, 1000);
  });
  input.addEventListener('change', function() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      const storageAvailable = await isStorageAvailable();
      if (storageAvailable) {
        saveSettings();
      }
    }, 100);
  });
});
